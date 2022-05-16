var Vars = {
	// From storage
	eReporting:false,
	bNotifications:false,
	pSessions:false,
	sessionData:{},
	Premium:"",

	// Trace Presets
	usePresets:false,
	preset:2,

	// Trace pausing
	paused:false,
	pauseEnd:0,

	// Refresh constants
	UserAgentInterval:999999999,
	GPUInterval:999999999,
	FakeIPInterval:1,

	uninstallUrl:"https://absolutedouble.co.uk/trace/extension-uninstall?e=",

	// Blocklist URLs
	blocklistURL:"https://trace-extension.absolutedouble.co.uk/app/weblist.php",
	blocklistFallback:"https://raw.githubusercontent.com/jake-cryptic/hmfp_lists/master/fallback.json",
	blocklistOffline:(chrome.hasOwnProperty("extension") ? chrome.runtime.getURL("data/blocklist.json") : browser.extension.getURL("data/blocklist.json")),
	blocklistBase:"https://trace-extension.absolutedouble.co.uk/app/weblist.php?p=",
	appSecret:"Cza7kImqFYZPrbGq76PY8I9fynasuWyEoDtY4L9U0zgIACb2t9vpn2sO4eHcS0Co",		// Is this pointless? Yes. Do I care? No.
	serverNames:{
		0:"main",
		1:"GitHub",
		2:"local",
		3:"cache"
	},

	// Blocker Vars
	listCompat:"210",
	callbacks:[],

	// Notification constant
	notifIcon:"icons/trace_256.png",

	// User agent values (move these later)
	uaSettings:{
		"os": {
			"windows":{
			//	"Windows 10 (x64)": "Windows NT 10.0; Win64; x64"
			//	"Windows 10 (x86)": "Windows NT 10.0; en-US",
			//	"Windows 8.1 (x64)":"Windows NT 6.3; Win64; x64",
			//	"Windows 8.1 (x86)":"Windows NT 6.3; en-US",
			//	"Windows 8 (x64)":"Windows NT 6.2; Win64; x64",
			//	"Windows 8 (x86)":"Windows NT 6.2; en-US",
				"Windows 7 (x64)":"Windows NT 6.1; Win64; x64"
			//	"Windows 7 (x86)":"Windows NT 6.1; en-US"
			},
			"linux":{
				"linux 64bit":"X11; Linux x86_64",
				//"linux 32bit":"X11; Linux x86_32",
				//"linux 64bit":"X11; Linux armv7l", 
			},
			"macos":{
                "macos monteray":"Macintosh; Intel Mac OS X 10_15_7"
				//"macos mojave3":"Macintosh; Intel Mac OS X 10_14_6",
				//"macos mojave2":"Macintosh; Intel Mac OS X 10_14_0",
				//"macos mojave":"Macintosh; Intel Mac OS X 10_14",
				//"macos high sierra2":"Macintosh; Intel Mac OS X 10_13_6",
				//"macos high sierra":"Macintosh; Intel Mac OS X 10_13",
				//"macos sierra":"Macintosh; Intel Mac OS X 10_12_2"
			}
		},
		"wb":{
			"chrome":{
				//"86":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"dsfdsf
				
				//"99":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Safari/537.36",
				"101":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4893.203 Safari/537.36"
				//"101":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.34 Safari/537.36",
			},
			"firefox":{
				"82":"Gecko/20100101 Firefox/82.0",
				"81":"Gecko/20100101 Firefox/81.0"
			},
			"vivaldi":{
				//"84":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 OPR/86.0.4363.23",
				//"2.70":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.137 Safari/537.36 Vivaldi/2.7.1628.33",
				//"2.30":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.82 Safari/537.36 Vivaldi/2.3.1440.41"
			},
			"opera":{
				"86":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 OPR/86.0.4363.23",
				"80":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4874.167 Safari/537.36 OPR/80.0.3067.72",
				"85":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36 OPR/85.0.4341.65",

				//"46":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36 OPR/46.0.2207.0 OMI/4.20.3.54.Catcher2.202 HbbTV/1.5.1 (+DRM;Hisense;SmartTV_2020;V0000.01.00S.M0222;HE65U6F1UWTSG;SmartTV_2020;) FVC/4.0 (Hisense;SmartTV_2020;) LaTivu_1.0.1_2020",
				//"57":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106",
				//"54":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36 OPR/54.0.2952.54"
			},
			"edge":{
				// "cr1":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4664.110 Safari/537.36 Edg/100.0.1054.62",
				// "cr2":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4845.0 Safari/537.36 Edg/100.0.1154.0",
				// "cr3":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4845.0 Safari/537.36 Edg/100.0.1155.0",
				// "cr4":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1108.43 Safari/537.36 Edg/100.0.1108.43",
				// "cr5":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4851.0 Safari/537.36 Edg/100.0.1158.0",
				// "cr6":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4851.0 Safari/537.36 Edg/100.0.1156.0",
				// "cr7":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4855.0 Safari/537.36 Edg/100.0.1160.0",
				// "cr8":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4851.0 Safari/537.36 Edg/100.0.1156.1",
				// "cr9":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1161.0 Safari/537.36 Edg/100.0.1161.0",
				// "cr10":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4855.0 Safari/537.36 Edg/100.0.1161.0",
				// "cr11":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4855.0 Safari/537.36 Edg/100.0.1162.0",
				// "cr12":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4863.0 Safari/537.36 Edg/100.0.1163.0",
				// "cr13":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4867.0 Safari/537.36 Edg/100.0.1165.0",
				// "cr14":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4867.0 Safari/537.36 Edg/100.0.1166.0",
				// "cr15":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4863.0 Safari/537.36 Edg/100.0.1163.1",
				// "cr16":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4867.0 Safari/537.36 Edg/100.0.1167.0",
				// "cr17":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4867.0 Safari/537.36 Edg/100.0.1168.0",
				// "cr18":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1108.56 Safari/537.36 Edg/100.0.1108.56",
				// "cr19":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4867.0 Safari/537.36 Edg/100.0.1169.0",
				// "cr20":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4867.0 Safari/537.36 Edg/100.0.1169.1",
				// "cr21":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4882.0 Safari/537.36 Edg/100.0.1176.0",
				// "cr22":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4880.0 Safari/537.36 Edg/100.0.1175.0",
				// "cr23":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4884.0 Safari/537.36 Edg/100.0.1179.0",
				// "cr24":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1108.62 Safari/537.36 Edg/100.0.1108.62",
				// "cr25":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4884.0 Safari/537.36 Edg/100.0.1180.0",
				// "cr26":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4884.0 Safari/537.36 Edg/100.0.1181.0",
				// "cr27":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4894.0 Safari/537.36 Edg/100.0.1183.0",
				// "cr28":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1108.55 Safari/537.36 Edg/100.0.1108.55",
				// "cr29":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.0 Safari/537.36 Edg/100.0.1188.0",
				// "cr30":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.0 Safari/537.36 Edg/100.0.1189.0",
				// "cr31":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1150.30 Safari/537.36 Edg/100.0.1150.30",
				// "cr32":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1150.39 Safari/537.36 Edg/100.0.1150.39",
				// "cr33":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.20 Safari/537.36 Edg/100.0.1185.7",
				// "cr34":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.0 Safari/537.36 Edg/100.0.1185.0",
				// "cr35":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.20 Safari/537.36 Edg/100.0.1185.10",
				// "cr36":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.30 Safari/537.36 Edg/100.0.1185.12",
				// "cr37":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1150.46 Safari/537.36 Edg/100.0.1150.46",
				// "cr38":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1150.36 Safari/537.36 Edg/100.0.1150.36",
				// "cr39":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.46 Safari/537.36 Edg/100.0.1185.17",
				// "cr40":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.56 Safari/537.36 Edg/100.0.1185.23",
				// "cr41":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.1150.55 Safari/537.36 Edg/100.0.1150.55",
				// "cr42":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.29",
				// "cr43":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.27",
				// "cr44":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.31",
				// "cr45":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.100.1185.29 Safari/537.36 Edg/100.0.1185.29",
				// "cr46":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.78",
				// "cr47":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36",
				// "cr48":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.93",
				// "cr49":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.36",
				// "cr50":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39",
				// "cr51":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.29",
				// "cr52":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.94",
				// "cr53":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.51",
				// "cr54":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.34",
				"cr55":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.88"
				// "cr56":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.44"
				//"cr100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36 Edg/101.0.1210.32"


				//"cr88":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4287.0 Safari/537.36 Edg/88.0.673.0",
				//"cr86":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36 Edg/86.0.622.56"
			},
			"safari":{
				"aa": "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
				// "1":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4892.0 Safari/537.36",
				// "2":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4758.102 Safari/537.36",
				// "3":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4893.0 Safari/537.36",
				// "4":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4844.35 Safari/537.36",
				// "5":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4894.0 Safari/537.36",
				// "6":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4883.2 Safari/537.36",
				// "7":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4895.0 Safari/537.36",
				// "8":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.0 Safari/537.36",
				// "9":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.3 Safari/537.36",
				// "10":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.12 Safari/537.36",
				// "11":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.16 Safari/537.36",
				// "12":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.20 Safari/537.36",
				// "13":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4844.51 Safari/537.36",
				// "14":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4844.45 Safari/537.36",
				// "15":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.30 Safari/537.36",
				// "16":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4515.131 Safari/537.36",
				// "17":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4844.65 Safari/537.36",
				// "18":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.46 Safari/537.36",
				// "19":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4844.74 Safari/537.36",
				// "20":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4850.130 Safari/537.36",
				// "21":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4844.82 Safari/537.36",
				// "22":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.43 Safari/537.36",
				// "23":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4867.104 Safari/537.36",
				// "24":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.56 Safari/537.36",
				// "25":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4869.164 Safari/537.36",
				// "26":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4895.137 Safari/537.36",
				// "27":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.52 Safari/537.36",
				// "28":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36",
				// "29":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4872.84 Safari/537.36",
				// "30":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4844.84 Safari/537.36",
				// "31":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.62 Safari/537.36",
				// "32":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.63 Safari/537.36",
				// "33":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.660 Safari/537.36",
				// "34":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.47",
				// "35":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.09",
				// "36":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.54",
				// "37":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.60",
				// "38":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
				// "39":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4862.138 Safari/537.36",
				// "40":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.28",
				// "41":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.79 Safari/537.36",
				// "42":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.12",
				// "43":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.54",
				// "44":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.22",
				// "45":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.95",
				// "46":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.93",
				// "47":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.21",
				// "48":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.29",
				// "49":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4881.173 Safari/537.36",
				// "50":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.41",
				// "51":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4650.4 Safari/537.36",
				// "52":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4888.195 Safari/537.36",
				// "53":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4891.179 Safari/537.36",
				// "54":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36",
				// "55":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.26",
				// "56":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.74",
				// "57":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.94",
				// "58":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.92 Safari/537.36",
				// "59":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.90 Safari/537.36",
				// "60":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4868.212 Safari/537.36",
				// "61":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.32",
				// "62":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4885.111 Safari/537.36",
				// "63":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.78",
				// "64":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
				// "65":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.133 Safari/537.36",
				// "66":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.64",
				// "67":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.40",
				// "68":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.68",
				// "69":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.368",
				
			}
		}
	},

	gpuModels: [
	
		
		'NVIDIA, NVIDIA GeForce GTX 1070'

	
	],
	gpuChose:"NVIDIA, NVIDIA GeForce GTX 1050",

	// Current UA settings
	useragent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.50",
	oscpu:"Windows NT 10.0; Win64; x64",
	platform:"Win64"
};