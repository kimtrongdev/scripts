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
				"Windows 10 (x64)": "Windows NT 10.0; Win64; x64",
			//	"Windows 10 (x86)": "Windows NT 10.0; en-US",
				"Windows 8.1 (x64)":"Windows NT 6.3; Win64; x64",
			//	"Windows 8.1 (x86)":"Windows NT 6.3; en-US",
				"Windows 8 (x64)":"Windows NT 6.2; Win64; x64",
			//	"Windows 8 (x86)":"Windows NT 6.2; en-US",
				"Windows 7 (x64)":"Windows NT 6.1; Win64; x64",
			//	"Windows 7 (x86)":"Windows NT 6.1; en-US"
			},
			"linux":{
				"linux 64bit":"X11; Linux x86_64",
				//"linux 32bit":"X11; Linux x86_32",
				//"linux 64bit":"X11; Linux armv7l", 
			},
			"macos":{
                "macos monteray":"Macintosh; Intel Mac OS X 10_15_7",
				"macos mojave3":"Macintosh; Intel Mac OS X 10_14_6",
				"macos mojave2":"Macintosh; Intel Mac OS X 10_14_0",
				"macos mojave":"Macintosh; Intel Mac OS X 10_14",
				"macos high sierra2":"Macintosh; Intel Mac OS X 10_13_6",
				"macos high sierra":"Macintosh; Intel Mac OS X 10_13",
				"macos sierra":"Macintosh; Intel Mac OS X 10_12_2"
			}
		},
		"wb":{
			"chrome":{
				//"86":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"dsfdsf
				"100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
				"100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36",
				//"99":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Safari/537.36",
				"101":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4893.203 Safari/537.36",
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
				"cr100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4664.110 Safari/537.36 Edg/100.0.1054.62",
				"cr100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4855.0 Safari/537.36 Edg/100.0.1160.0",
				"cr100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.50",
				"cr100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.44",
				"cr101":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.34 Safari/537.36 Edg/101.0.1210.19",
				"cr100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.88"


				//"cr88":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4287.0 Safari/537.36 Edg/88.0.673.0",
				//"cr86":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36 Edg/86.0.622.56"
			},
			"safari":{
				"100":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36",
				//"12.1":"AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15",
				//"12.0":"AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15",
			}
		}
	},

	gpuModels: [
	/*	
		'AMD Radeon HD 7700 Series',
		'AMD Radeon HD 7800 Series',
		'AMD Radeon HD 8240',
		
		// AMD 5000 series
		'AMD Radeon RX 5500 XT',
		'AMD Radeon RX 5600 XT',
		'AMD Radeon RX 5700 XT',

		'AMD Radeon(TM) Vega 8 Graphics',
		'AMD Radeon(TM) HD 6480G',
		'AMD Radeon(TM) HD 6520G',
		'ATI Mobility Radeon HD 4250',
		'ATI Mobility Radeon HD 5470',
		'ATI Mobility Radeon HD 5650',
		'ATI Radeon HD 4200',
		'ATI Radeon HD 4300/4500 Series',
		'ATI Radeon HD 4600 Series',
		'ATI Radeon HD 5470',
		'ATI Radeon HD 5570',
		'ATI Radeon HD 5670',
		'Intel(R) HD Graphics',
		'Intel(R) HD Graphics Family',

	,
		'Intel(R) HD Graphics 6100',
		'Intel(R) HD Graphics 6200',

		// 7th Gen Intel processors
		'Intel(R) HD Graphics 610',
		'Intel(R) HD Graphics 615',
		'Intel(R) HD Graphics 620',
		'Intel(R) HD Graphics 630',

		// 8th Gen Intel processors
		'Intel(R) UHD Graphics 610',
		'Intel(R) UHD Graphics 615',
		'Intel(R) UHD Graphics 617',
		'Intel(R) UHD Graphics 620',
		'Intel(R) UHD Graphics 630',

		// Legacy Intel graphics
		'Mobile Intel(R) 4 Series Express Chipset Family',
		'Mobile Intel(R) 965 Express Chipset Family',
		'Intel(R) Q35 Express Chipset Family',
		'Intel(R) Q45/Q43 Express Chipset',
		'Intel(R) Q965/Q963 Express Chipset Family',
		'Intel(R) 4 Series Internal Chipset',
		'Intel(R) 82945G Express Chipset Family',
		'Intel(R) G33/G31 Express Chipset Family',
		'Intel(R) G41 Express Chipset',
		'Intel(R) G45/G43 Express Chipset',

		'Intel(R) Graphics Media Accelerator 3150',
		'Intel(R) Graphics Media Accelerator 3600 Series',
		'Intel(R) Graphics Media Accelerator HD',

		'NVIDIA GeForce GTX 760',
		'NVIDIA Quadro 4000M',
		'NVIDIA Quadro 2000M',
		'NVIDIA Quadro K2000M',
		'NVIDIA Quadro K420',
		'NVIDIA Quadro NVS 140M',
		'NVIDIA Quadro NVS 150M',
		'NVIDIA Quadro NVS 160M',
		'NVIDIA GeForce GTX 960M',
		'NVIDIA GeForce GTX 970M',
		'NVIDIA GeForce GTX 980M',
		'NVIDIA GeForce GTX 1050M',
		'NVIDIA GeForce GTX 1060M',
		'NVIDIA GeForce GTX 1070M',
		'NVIDIA GeForce GTX 1080M',
		*/
	
		//
		'NVIDIA, NVIDIA GeForce GTX 1050' ,
		'NVIDIA, NVIDIA GeForce GTX 1660 SUPER',
		'NVIDIA, NVIDIA GeForce GTX 970',
		'NVIDIA, NVIDIA GeForce RTX 3060 Laptop GPU',
		'NVIDIA, NVIDIA GeForce GT 620',
		'NVIDIA, NVIDIA GeForce GTX 1080',
		'NVIDIA, NVIDIA GeForce GT 1030',
		'NVIDIA GeForce GTX 1050 Ti',
		'NVIDIA, NVIDIA GeForce GTX 1080 Ti',
		'NVIDIA, NVIDIA GeForce GTX 960',
		'NVIDIA, NVIDIA GeForce GTX 1060 3GB',
		'NVIDIA, NVIDIA GeForce GTX 1660 Ti',
		'NVIDIA, NVIDIA GeForce GTX 1060',
		'NVIDIA, NVIDIA GeForce RTX 3060',
		'NVIDIA GeForce GTX 1060 3GB',
		'NVIDIA GeForce RTX 2060',
		'NVIDIA, NVIDIA GeForce GT 720M',
		'NVIDIA, NVIDIA GeForce GTX 1050 Ti',
		'NVIDIA, NVIDIA GeForce GTX 1650',
		'NVIDIA, NVIDIA GeForce RTX 3050 Ti Laptop GPU',
		'NVIDIA GeForce GTX 1060 6GB',
		'NVIDIA, NVIDIA GeForce GTX 1650 Ti',
		'NVIDIA GeForce 920MX',
		'NVIDIA, NVIDIA GeForce GTX 950M',
		'NVIDIA, NVIDIA GeForce RTX 2080 SUPER',
		'NVIDIA GeForce RTX 3060 Ti',
		'NVIDIA, NVIDIA GeForce RTX 2060',
		'NVIDIA, NVIDIA GeForce RTX 3070',
		'NVIDIA, NVIDIA GRID K280Q',
		'NVIDIA, NVIDIA GeForce GTX 1660',
		'NVIDIA, NVIDIA GeForce RTX 2070 SUPER',
		'NVIDIA, NVIDIA Quadro RTX 4000',
		'NVIDIA GeForce GTX 1650',
		'NVIDIA GeForce RTX 3060 Laptop GPU',
		'NVIDIA, NVIDIA GeForce GTX 1060 6GB',
		'NVIDIA, NVIDIA GeForce GTX 750 Ti',
		'NVIDIA, NVIDIA GeForce GT 730',
		'NVIDIA, NVIDIA GeForce GTX 1070',
		'NVIDIA GeForce GT 710',
		'NVIDIA, NVIDIA GeForce RTX 2060 SUPER',
		'NVIDIA GeForce RTX 3050',
		'NVIDIA, NVIDIA GeForce RTX 3050',
,

	
	],
	gpuChose:"Intel(R) HD Graphics",

	// Current UA settings
	useragent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0",
	oscpu:"Windows NT 10.0; Win64; x64; rv:73.0",
	platform:"Win32"
};