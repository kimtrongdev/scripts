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
	UserAgentInterval:999999,
	GPUInterval:999999,
	FakeIPInterval:99999,

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
				//"Windows 10 (x86)": "Windows NT 10.0; en-US",
				"Windows 8.1 (x64)":"Windows NT 6.3; Win64; x64",
				//"Windows 8.1 (x86)":"Windows NT 6.3; en-US",
				"Windows 8 (x64)":"Windows NT 6.2; Win64; x64",
				//"Windows 8 (x86)":"Windows NT 6.2; en-US",
				"Windows 7 (x64)":"Windows NT 6.1; Win64; x64"
				//"Windows 7 (x86)":"Windows NT 6.1; en-US"
			},
			"linux":{
				"linux 64bit":"X11; Linux x86_64",
				"linux 32bit":"X11; Linux x86_32"
			},
			"macos":{
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
				"32":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36 Edg/101.0.1210.32"
			},
			"firefox":{
				"82":"Gecko/20100101 Firefox/82.0",
				"81":"Gecko/20100101 Firefox/81.0"
			},
			"vivaldi":{
				"2.70":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.137 Safari/537.36 Vivaldi/2.7.1628.33",
				"2.30":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.82 Safari/537.36 Vivaldi/2.3.1440.41"
			},
			"opera":{
				"57":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106",
				"54":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36 OPR/54.0.2952.54"
			},
			"edge":{
				"cr88":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4287.0 Safari/537.36 Edg/88.0.673.0",
				"cr86":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36 Edg/86.0.622.56"
			},
			"safari":{
				"12.1":"AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15",
				"12.0":"AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15",
			}
		}
	},

	gpuModels: [
		'NVIDIA, NVIDIA GeForce GTX 1050 Ti',
		'NVIDIA, NVIDIA GeForce RTX 3050',		
		'NVIDIA, NVIDIA GeForce RTX 2060',		
		'NVIDIA, GeForce GTX 1660 Ti',		
		'NVIDIA, NVIDIA GeForce GT 720M',		
		'NVIDIA, NVIDIA GeForce MX450',		
		'NVIDIA, NVIDIA GeForce GTX 1060 ',		
		'NVIDIA, NVIDIA GeForce RTX 2080',		
		'NVIDIA, GeForce GTX 1650',		
		'NVIDIA, NVIDIA GeForce GTX 1060 6GB',	
		'NVIDIA, NVIDIA GeForce RTX 3060 Ti	',	
		'NVIDIA, NVIDIA GeForce GTX 1050 Ti	',	
		'NVIDIA, GeForce GTX 1050 Ti',		
		'NVIDIA, NVIDIA GeForce GTX 1660',		
		'NVIDIA, NVIDIA GeForce GT 620',		
		'NVIDIA, NVIDIA GeForce RTX 3080',		
		'NVIDIA, NVIDIA GeForce GTX 750 Ti',		
		'NVIDIA, GeForce GTX 1060 6GB',		
		'NVIDIA, NVIDIA GeForce GTX 1650 Ti',		
		'NVIDIA, NVIDIA GeForce RTX 3070',		
		'NVIDIA, NVIDIA GeForce GTX 1050'

	],
	gpuChose:"Intel(R) HD Graphics",

	// Current UA settings
	useragent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0",
	oscpu:"Windows NT 10.0; Win64; x64; rv:73.0",
	platform:"Win32"
};