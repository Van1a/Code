import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.nerium_MONGODB_URI || "mongodb+srv://Vercel-Admin-nerium-data:TXGXPqKKairzq63l@nerium-data.nlg9ana.mongodb.net/?retryWrites=true&w=majority";
const RATE_LIMIT = 50;         
const BLOCK_TIME = 10 * 60e3;  

let client;
let db;

async function getDb() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('ratelimit');
  }
  return db;
}

async function checkRateLimit(ip) {
  const col = db.collection('requests');
  const now = Date.now();

  let record = await col.findOne({ ip });
  if (!record) {
    await col.insertOne({ ip, count: 1, firstRequest: now, blockedUntil: null });
    return true;
  }

  if (record.blockedUntil && now < record.blockedUntil) return false;

  if (now - record.firstRequest > 60 * 1000) {
    await col.updateOne({ ip }, { $set: { count: 1, firstRequest: now } });
    return true;
  } else if (record.count + 1 > RATE_LIMIT) {
    await col.updateOne({ ip }, { $set: { blockedUntil: now + BLOCK_TIME } });
    return false;
  } else {
    await col.updateOne({ ip }, { $inc: { count: 1 } });
    return true;
  }
}

export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  try {
    await getDb();
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in 10 minutes.' }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    console.error("Rate limiter error:", err);
  }

  return new Response(
`local Fluent = loadstring(game:HttpGet("https://github.com/dawid-scripts/Fluent/releases/latest/download/main.lua"))()

local Window = Fluent:CreateWindow({
    Title = "Code Scout Nerium | " .. game.MarketplaceService:GetProductInfo(game.PlaceId),
    SubTitle = "Just A Script",
    TabWidth = 160,
    Size = UDim2.fromOffset(400, 430),
    Acrylic = true,
    Theme = "Dark",
    MinimizeKey = Enum.KeyCode.LeftControl
})

local Tabs = {
    Main = Window:AddTab({ Title = "Main", Icon = "code-2" }),
    Code = Window:AddTab({ Title = "Active", Icon = "list" }),
    Removed = Window:AddTab({ Title = "Removed", Icon = "trash" }),
    Expired = Window:AddTab({ Title = "Expired", Icon = "clock" }),
    API = Window:AddTab({ Title = "API", Icon = "globe" })
}

function get(url)
    local response = request({ Url = url, Method = "GET" })
    return game.HttpService:JSONDecode(response.Body)
end

function notify(title, desc, time)
    Fluent:Notify({ Title = title, Content = desc, Duration = time })
end

notify("Checking Game", "This may take a while.", 5)

local gameInfo = game.MarketplaceService:GetProductInfo(game.PlaceId)
local stored = get("https://nerium.vercel.app/api/supported?find=" .. gameInfo.Name:gsub(" ", "-"))

local file
pcall(function()
    if isfile("Nerium/data.txt") then
        file = game.HttpService:JSONDecode(readfile("Nerium/data.txt"))
    end
end)

if not file then
    makefolder("Nerium")
    file = {}
    writefile("Nerium/data.txt", "[]")
end

function getGameData(name)
    for _, v in ipairs(file) do
        if v.name == name then
            return v
        end
    end
    local new = {name = name, usedCode = {}}
    table.insert(file, new)
    writefile("Nerium/data.txt", game.HttpService:JSONEncode(file))
    return new
end

function markRemoved(fileData, code)
    for _, c in ipairs(fileData.usedCode) do
        if c == code then return end
    end
    table.insert(fileData.usedCode, code)
    writefile("Nerium/data.txt", game.HttpService:JSONEncode(file))
end

function unmarkRemoved(fileData, code)
    for i = #fileData.usedCode, 1, -1 do
        if fileData.usedCode[i] == code then
            table.remove(fileData.usedCode, i)
            break
        end
    end
    writefile("Nerium/data.txt", game.HttpService:JSONEncode(file))
end

Tabs.Main:AddParagraph({ Title = "Welcome Client", Content = "" })

Tabs.Main:AddButton({
    Title = "Discord",
    Description = "",
    Callback = function()
        setclipboard("discord")
        notify("Copied", "", 5)
    end
})

Tabs.Main:AddParagraph({ Title = "Info", Content = "" })
Tabs.Main:AddParagraph({ Title = "Safe", Content = "" })
Tabs.Main:AddParagraph({ Title = "About", Content = "" })
Tabs.Main:AddParagraph({ Title = "Request", Content = "" })

if stored.isFound then
    local api = get("https://nerium.vercel.app/api/" .. stored.query).data
    local fileData = getGameData(stored.query)

    Tabs.Code:AddParagraph({ Title = "Active Codes", Content = "Click to copy" })

    Tabs.Code:AddButton({
        Title = "Refresh",
        Description = "Refresh",
        Callback = function()
            Window:Destroy()
            loadstring(game:HttpGet("https://nerium.vercel.app/api/loader"))()
        end
    })

    for _, v in pairs(api.Active) do
        Tabs.Code:AddButton({
            Title = v.Code,
            Description = v.Reward,
            Callback = (function(code)
                return function()
                    Window:Dialog({
                        Title = code,
                        Content = "",
                        Buttons = {
                            { Title = "Copy", Callback = function() setclipboard(code); notify("Copied", code, 3) end },
                            { Title = "Remove", Callback = function() markRemoved(fileData, code); notify("Marked Removed", code, 3) end }
                        }
                    })
                end
            end)(v.Code)
        })
    end

    Tabs.Removed:AddParagraph({ Title = "Removed Codes", Content = "Codes you've marked removed" })

    for _, code in ipairs(fileData.usedCode) do
        Tabs.Removed:AddButton({
            Title = code,
            Description = "Click to manage",
            Callback = (function(c)
                return function()
                    Window:Dialog({
                        Title = c,
                        Content = "",
                        Buttons = {
                            { Title = "Copy", Callback = function() setclipboard(c); notify("Copied", c, 3) end },
                            { Title = "Return", Callback = function() unmarkRemoved(fileData, c); notify("Returned", c, 3) end }
                        }
                    })
                end
            end)(code)
        })
    end

    Tabs.Expired:AddParagraph({ Title = "Expired Codes", Content = "No longer valid" })

    for _, v in pairs(api.Expired) do
        Tabs.Expired:AddButton({
            Title = v.Code,
            Description = v.Reward,
            Callback = (function(code) return function() setclipboard(code); notify("Copied", code, 3) end end)(v.Code)
        })
    end
else
    Window:Dialog({
        Title = "Terminating",
        Content = "",
        Buttons = {{ Title = "Ok", Callback = function() Window:Destroy() end }}
    })
end

Tabs.API:AddParagraph({ Title = "API", Content = "" })

Tabs.API:AddButton({
    Title = "Website",
    Description = "Nerium.vercel.app",
    Callback = function() setclipboard("https://nerium.vercel.app/") end
})

Tabs.API:AddButton({
    Title = "Code List",
    Description = "/api/game-name",
    Callback = function() setclipboard("https://nerium.vercel.app/api/[game-name]") end
})

Tabs.API:AddButton({
    Title = "Supported List",
    Description = "/api/supported",
    Callback = function() setclipboard("https://nerium.vercel.app/api/supported") end
})

Tabs.API:AddButton({
    Title = "Supported Check",
    Description = "/api/supported?find=game-name",
    Callback = function() setclipboard("https://nerium.vercel.app/api/supported?find=[game]") end
})

notify("Fluent", "The script has been loaded.", 8)`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
