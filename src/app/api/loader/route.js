export async function GET() {
  return new Response(
`local Fluent = loadstring(game:HttpGet("https://github.com/dawid-scripts/Fluent/releases/latest/download/main.lua"))()

local Window = Fluent:CreateWindow({
    Title = "Nerium API | " .. game.MarketplaceService:GetProductInfo(game.PlaceId),
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

local function get(url)
    local response = request({ Url = url, Method = "GET" })
    return game.HttpService:JSONDecode(response.Body)
end

local function notify(title, desc, time)
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

local function getGameData(name)
    for _, v in ipairs(file) do
        if v.name == name then
            return v
        end
    end
    table.insert(file, new)
    writefile("Nerium/data.txt", game.HttpService:JSONEncode(file))
    return {name = name, usedCode = {}}
end

local function markRemoved(fileData, code)
    for _, c in ipairs(fileData.usedCode) do
        if c == code then
            return
        end
    end
    table.insert(fileData.usedCode, code)
    writefile("Nerium/data.txt", game.HttpService:JSONEncode(file))
end

local function unmarkRemoved(fileData, code)
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
        Description = "Reload UI (placeholder)",
        Callback = function()
            Window:Destroy()
            loadstring(game:HttpGet("https://your.script.url/here"))()
        end
    })

    for _, v in pairs(api.Active) do
        Tabs.Code:AddButton({
            Title = v.Code,
            Description = v.Reward,
            Callback = (function(code, reward)
                return function()
                    Window:Dialog({
                        Title = code,
                        Content = "",
                        Buttons = {
                            {
                                Title = "Copy",
                                Callback = function()
                                    setclipboard(code)
                                    notify("Copied", code, 3)
                                end
                            },
                            {
                                Title = "Remove",
                                Callback = function()
                                    markRemoved(fileData, code)
                                    notify("Marked Removed", code, 3)
                                end
                            }
                        }
                    })
                end
            end)(v.Code, v.Reward)
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
                            {
                                Title = "Copy",
                                Callback = function()
                                    setclipboard(c)
                                    notify("Copied", c, 3)
                                end
                            },
                            {
                                Title = "Return",
                                Callback = function()
                                    unmarkRemoved(fileData, c)
                                    notify("Returned", c, 3)
                                end
                            }
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
            Callback = (function(code)
                return function()
                    setclipboard(code)
                    notify("Copied", code, 3)
                end
            end)(v.Code)
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
    Description = "",
    Callback = function()
        setclipboard("https://nerium.vercel.app/")
    end
})

Tabs.API:AddButton({
    Title = "Code List",
    Description = "",
    Callback = function()
        setclipboard("https://nerium.vercel.app/api/[game-name]")
    end
})

Tabs.API:AddButton({
    Title = "Supported List",
    Description = "",
    Callback = function()
        setclipboard("https://nerium.vercel.app/api/supported")
    end
})

Tabs.API:AddButton({
    Title = "Supported Check",
    Description = "",
    Callback = function()
        setclipboard("https://nerium.vercel.app/api/supported?find=[game]")
    end
})

notify("Fluent", "The script has been loaded.", 8)`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
