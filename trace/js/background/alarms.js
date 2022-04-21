var Alarms = {
	Toggle:{
		UserAgentRandomiser:function(onlyStart){
			if (Prefs.Current.Pref_UserAgent.enabled === true){
				// Create random user agent
				Alarms.Updaters.ChooseUserAgent();

				// Assign browser event
				//chrome.alarms.create("UserAgentRefresh",{periodInMinutes: Vars.UserAgentInterval});
			} else {
				if (!onlyStart){
					chrome.alarms.clear("UserAgentRefresh",function(success) {
						if (!success) Trace.Notify("Failed to stop user-agent refresh process (It probably wasn't running)","uabgd");
					});
				}
			}
		},

		GPURandomiser:function(onlyStart){
			if (Prefs.Current.Pref_WebGLFingerprint.enabled === true){
				// Create random user agent
				Alarms.Updaters.ChooseGPU();

				// Assign browser event
				//chrome.alarms.create("GPURefresh",{periodInMinutes: Vars.GPUInterval});
			} else {
				if (!onlyStart){
					chrome.alarms.clear("GPURefresh",function(success) {
						if (!success) Trace.Notify("Failed to stop GPU refresh process (It probably wasn't running)","gpupd");
					});
				}
			}
		}
	},

	Updaters:{
		ChooseGPU:function(){
			if (Prefs.Current.Pref_WebGLFingerprint.enabled === false) return;

			// let gpuStr = rA(Vars.gpuModels);
			// let addDirectX = rA(gpuDirectStr) || "";
			// if (Prefs.Current.Pref_WebGLFingerprint.gpuList.list.length !== 0){
			// 	gpuStr = rA(Prefs.Current.Pref_WebGLFingerprint.gpuList.list);
			// }

			Vars.gpuChose = 'Apple GPU'//rA(Prefs.Current.Pref_WebGLFingerprint.gpuList.list) //"ANGLE (" + gpuStr + " " + addDirectX + ")";
		},

		ChooseUserAgent:function(){
			//let uA = rA(Prefs.Current.Pref_UserAgent.uaCust.customUAs)
			Vars.useragent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15'
			//let m = uA.match(/\((.*?)\)/)
			Vars.oscpu = 'Macintosh; Intel Mac OS X 10_15_7' //m[1]
			Vars.platform = 'MacIntel'
			return Vars.useragent;

			// If user has enabled custom user agents and set some
			if (Prefs.Current.Pref_UserAgent.uaCust.enabled === true && Prefs.Current.Pref_UserAgent.uaCust.customUAs.length > 0){
				let uA = rA(Prefs.Current.Pref_UserAgent.uaCust.customUAs)
				Vars.useragent = uA
				let m = uA.match(/\((.*?)\)/)
			  Vars.oscpu = m[1]
				Vars.platform = 'Win64'
				return Vars.useragent;
			}

			// Choose OS
			let uaOSPool = [];
			if (Prefs.Current.Pref_UserAgent.uaOSConfig.AllowLinux.enabled === true){
				uaOSPool = uaOSPool.concat(Object.values(Vars.uaSettings.os.linux));
			}
			if (Prefs.Current.Pref_UserAgent.uaOSConfig.AllowMac.enabled === true){
				uaOSPool = uaOSPool.concat(Object.values(Vars.uaSettings.os.macos));
			}
			if (Prefs.Current.Pref_UserAgent.uaOSConfig.AllowWindows.enabled === true){
				uaOSPool = uaOSPool.concat(Object.values(Vars.uaSettings.os.windows));
			}

			// Choose browser
			let uaWBPool = [];
			if (Prefs.Current.Pref_UserAgent.uaWBConfig.AllowChrome.enabled === true){
				uaWBPool = uaWBPool.concat(Object.values(Vars.uaSettings.wb.chrome));
			}
			if (Prefs.Current.Pref_UserAgent.uaWBConfig.AllowFirefox.enabled === true){
				uaWBPool = uaWBPool.concat(Object.values(Vars.uaSettings.wb.firefox));
			}
			if (Prefs.Current.Pref_UserAgent.uaWBConfig.AllowEdge.enabled === true){
				uaWBPool = uaWBPool.concat(Object.values(Vars.uaSettings.wb.edge));
			}
			if (Prefs.Current.Pref_UserAgent.uaWBConfig.AllowSafari.enabled === true){
				uaWBPool = uaWBPool.concat(Object.values(Vars.uaSettings.wb.safari));
			}
			if (Prefs.Current.Pref_UserAgent.uaWBConfig.AllowVivaldi.enabled === true){
				uaWBPool = uaWBPool.concat(Object.values(Vars.uaSettings.wb.vivaldi));
			}

			Vars.oscpu = rA(uaOSPool);
			let browser = rA(uaWBPool);

			// Special case for firefox on mac, Thanks: https://github.com/jake-cryptic/AbsoluteDoubleTrace/issues/3#issuecomment-437178452
			if (Vars.oscpu.toLowerCase().includes("mac")){
				if (browser.includes("Firefox")){
					Vars.oscpu = Vars.oscpu.replace(/_/g,".");
				}
			}

			Vars.useragent = "Mozilla/5.0 (" + Vars.oscpu + ") " + browser;

			if (Vars.oscpu.toLowerCase().includes("win")){
				Vars.platform = rA(["Win32","Win64"]);
			} else if (Vars.oscpu.toLowerCase().includes("mac")){
				Vars.platform = rA(["MacIntel","MacPPC"]);
			} else {
				Vars.platform = rA(["Linux","X11","Linux 1686"]);
			}
		},
	},

	Start:function(){
		if (!chrome.alarms) {
			console.error("Alarms aren't supported in this browser.");
			return false;
		}

		try{
			chrome.alarms.onAlarm.addListener(Alarms.Event);
		} catch(e){
			if (e.message){
				console.log(e.message);
			} else {
				console.warn("Error starting alarm events, mabye browser doesn't support them?");
			}
		}
	},

	Event:function(a){
		switch (a.name){
			case "UserAgentRefresh":
				if (Prefs.Current.Pref_UserAgent.enabled === true) Alarms.Updaters.ChooseUserAgent();
				break;
			case "GPURefresh":
				if (Prefs.Current.Pref_WebGLFingerprint.enabled === true) Alarms.Updaters.ChooseGPU();
				break;
			case "StatsDatabaseRefresh":
				if (Prefs.Current.Main_Trace.ProtectionStats.enabled === true) Stats.SaveStats();
				break;
			case "UserFakeIPRefresh":
				if (Prefs.Current.Pref_IPSpoof.enabled !== true || Prefs.Current.Pref_IPSpoof.traceIP.enabled === true){
					Trace.i.StopIPRefresh();
					break;
				}
				Trace.i.RefreshFakeUserIP();
				break;
			default:
				console.warn("Unknown alarm: " + a.name);
				break;
		}
	}
};