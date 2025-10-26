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

local gameInfo = game.MarketplaceService:GetProductInfo(game.PlaceId)

local Window = Fluent:CreateWindow({
    Title = "Code Scout Nerium | " .. (gameInfo.Name or "Unknown"),
    SubTitle = "Just A Script",
    TabWidth = 160,
    Size = UDim2.fromOffset(430, 400),
    Acrylic = true,
    Theme = "Dark",
    MinimizeKey = Enum.KeyCode.LeftControl
})

local Tabs = {
    Main = Window:AddTab({ Title = "Main", Icon = "home" }),
    Code = Window:AddTab({ Title = "Active", Icon = "code-2" }),
    Removed = Window:AddTab({ Title = "Removed", Icon = "trash" }),
    Expired = Window:AddTab({ Title = "Expired", Icon = "clock" }),
    API = Window:AddTab({ Title = "API", Icon = "globe" })
}

function get(url)
    local response = request({ Url = url, Method = "GET" })
    return game.HttpService:JSONDecode(response.Body)
end

function notify(t,d,time)
    Fluent:Notify({ Title = t, Content = d, Duration = time })
end

notify("Checking Game","Fetching game support info...",5)

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
    writefile("Nerium/data.txt","[]")
end

function getGameData(name)
    for _,v in ipairs(file) do
        if v.name == name then
            return v
        end
    end
    local newEntry = {name = name, usedCode = {}}
    table.insert(file,newEntry)
    writefile("Nerium/data.txt",game.HttpService:JSONEncode(file))
    return newEntry
end

function markRemoved(f,c)
    for _,v in ipairs(f.usedCode) do
        if v == c then return end
    end
    table.insert(f.usedCode,c)
    writefile("Nerium/data.txt",game.HttpService:JSONEncode(file))
end

function unmarkRemoved(f,c)
    for i=#f.usedCode,1,-1 do
        if f.usedCode[i] == c then
            table.remove(f.usedCode,i)
            break
        end
    end
    writefile("Nerium/data.txt",game.HttpService:JSONEncode(file))
end

Tabs.Main:AddParagraph({ Title = "Welcome", Content = "Use Code Scout Nerium to manage and copy in-game redeem codes easily." })

local supported = "default"

Tabs.Main:AddInput("Input",{
    Title = "Game Name",
    Default = "Default",
    Numeric = false,
    Finished = false,
    Placeholder = "anime eternal",
    Callback = function(v)
        supported = v
    end
})

Tabs.Main:AddButton({
    Title = "Check Game Support",
    Description = "Check if your game is supported",
    Callback = function()
        local s,r = pcall(function()
            return game:HttpGet("https://nerium.vercel.app/api/supported?find=" .. supported:gsub(" ", "-"))
        end)
        if not s then return end
        if string.find(r,'"isFound":true') then
            Window:Dialog({
                Title = "Game Supported",
                Content = "This game is supported by Code Scout Nerium.\nYou can now use the Active Codes tab.",
                Buttons = {
                    { Title = "Copy Game Identifier", Callback = function() setclipboard(supported:gsub(" ", "-")); notify("Copied",supported:gsub(" ", "-"),3) end }
                }
            })
        else
            Window:Dialog({
                Title = "Not Supported",
                Content = "This game is currently **not supported**.\nVisit **nerium.vercel.app/home** to request support or view supported games.",
                Buttons = { { Title = "Close" } }
            })
        end
    end
})

if stored and stored.isFound and stored.query then
    Window:Dialog({
        Title = "Supported Game Detected",
        Content = "This game is supported.\nCodes will be displayed automatically.",
        Buttons = { { Title = "Ok" } }
    })

    local api = get("https://nerium.vercel.app/api/" .. stored.query).data
    local f = getGameData(stored.query)

    Tabs.Code:AddParagraph({ Title = "Active Codes", Content = "Tap to view and manage." })

    Tabs.Code:AddButton({
        Title = "Refresh Codes",
        Description = "Reload UI",
        Callback = function()
            Window:Destroy()
            loadstring(game:HttpGet("https://nerium.vercel.app/api/loader"))()
        end
    })

    for _, v in pairs(api.Active) do
        local skip = false
        for _, j in ipairs(f.usedCode) do
            if j == v.Code then
                skip = true
                break
            end
        end
        if not skip then
            Tabs.Code:AddButton({
                Title = v.Code,
                Description = v.Reward,
                Callback = function()
                    Window:Dialog({
                        Title = v.Code,
                        Content = "Choose an action.",
                        Buttons = {
                            { Title = "Copy", Callback = function() setclipboard(v.Code); notify("Copied", v.Code, 3) end },
                            { Title = "Mark Used", Callback = function() markRemoved(f, v.Code); notify("Marked", v.Code, 3) end }
                        }
                    })
                end
            })
        end
    end

    Tabs.Removed:AddParagraph({ Title = "Used Codes", Content = "" })
    for _,c in ipairs(f.usedCode) do
        Tabs.Removed:AddButton({
            Title = c,
            Description = "Manage code",
            Callback = function()
                Window:Dialog({
                    Title = c,
                    Content = "Choose an action.",
                    Buttons = {
                        { Title = "Copy", Callback = function() setclipboard(c); notify("Copied",c,3) end },
                        { Title = "Return", Callback = function() unmarkRemoved(f,c); notify("Returned",c,3) end }
                    }
                })
            end
        })
    end

    Tabs.Expired:AddParagraph({ Title = "Expired Codes", Content = "" })
    for _,v in pairs(api.Expire) do
        Tabs.Expired:AddButton({ Title = v, Callback = function() setclipboard(v); notify("Copied",v,3) end })
    end

else
    Window:Dialog({
        Title = "Game Not Supported",
        Content = "This experience is not in the supported list.\nYou may close the window.",
        Buttons = { { Title = "Close", Callback = function() Window:Destroy() end } }
    })
end

Tabs.API:AddParagraph({ Title = "API Access", Content = "" })
Tabs.API:AddButton({ Title = "Website", Description = "nerium.vercel.app", Callback = function() setclipboard("https://nerium.vercel.app/") end })
Tabs.API:AddButton({ Title = "Code List", Description = "/api/game-name", Callback = function() setclipboard("https://nerium.vercel.app/api/[game-name]") end })
Tabs.API:AddButton({ Title = "Supported List", Description = "/api/supported", Callback = function() setclipboard("https://nerium.vercel.app/api/supported") end })
Tabs.API:AddButton({ Title = "Supported Check", Description = "/api/supported?find=game-name", Callback = function() setclipboard("https://nerium.vercel.app/api/supported?find=[game]") end })

notify("Fluent","The script has been loaded.",8)`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
