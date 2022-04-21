var Alarms = {
	Toggle:{
		UserAgentRandomiser:function(onlyStart){
			if (Prefs.Current.Pref_UserAgent.enabled === true){
				// Create random user agent
				Alarms.Updaters.ChooseUserAgent();

				// Assign browser event
				chrome.alarms.create("UserAgentRefresh",{periodInMinutes: Vars.UserAgentInterval});
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
				chrome.alarms.create("GPURefresh",{periodInMinutes: Vars.GPUInterval});
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
			// if (Prefs.Current.Pref_WebGLFingerprint.enabled === false) return;

			// let gpuStr = rA(Vars.gpuModels);
			// let addDirectX = rA(gpuDirectStr) || "";
			// if (Prefs.Current.Pref_WebGLFingerprint.gpuList.list.length !== 0){
			// 	gpuStr = rA(Prefs.Current.Pref_WebGLFingerprint.gpuList.list);
			// }

			Vars.gpuChose = rA([
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GT-610--Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-MX450-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD-Radeon-R7-350-Series-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(ATI-Technologies-Inc.,-AMD-Radeon-Pro-5300M-OpenGL-Engine,-OpenGL-4.1)",
				"ANGLE-(Intel(R)-UHD-Graphics-630-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(Intel,-Intel(R)-UHD-Graphics-630-Direct3D11-vs_5_0-ps_5_0,-D3D11-21.20.16.5077)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1050-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1660-SUPER-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GT-620-Direct3D11-vs_5_0-ps_5_0,-D3D11-23.21.13.9135)",
				"ANGLE-(Intel(R)-HD-Graphics-Family-Direct3D9Ex-vs_3_0-ps_3_0)",
				"ANGLE-(AMD,-AMD-Radeon-RX-6600-XT-Direct3D11-vs_5_0-ps_5_0,-D3D11-30.0.15021.1001)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-970-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-3060-Laptop-GPU-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD,-AMD-Radeon(TM)-R6-Graphics-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA-GeForce-GT-730-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(Intel(R)-HD-Graphics-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(AMD-Radeon-HD-6570-Direct3D9Ex-vs_3_0-ps_3_0)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GT-620-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1080-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD,-Radeon-RX-580-Series-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(ATI-Technologies-Inc.,-AMD-Radeon-Pro-560-OpenGL-Engine,-OpenGL-4.1)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GT-1030-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA-GeForce-GTX-1050-Ti-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(AMD,-AMD-Radeon(TM)-R5-Graphics-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel,-Intel(R)-UHD-Graphics-630-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1080-Ti-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-960-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1060-3GB-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1660-Ti-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1060-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1660-Direct3D11-vs_5_0-ps_5_0,-D3D11-27.21.14.5671)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-3060-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA-GeForce-GTX-1060-3GB-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(NVIDIA-GeForce-RTX-2060-Direct3D9Ex-vs_3_0-ps_3_0)",
				"ANGLE-(AMD-Radeon-RX-6600-Direct3D9Ex-vs_3_0-ps_3_0)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GT-720M-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD,-Radeon-RX550/550-Series-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1050-Ti-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD,-AMD-Radeon-RX-6600-XT-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1650-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel,-Intel(R)-UHD-Graphics-730-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-3050-Ti-Laptop-GPU-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA-GeForce-GTX-1060-6GB-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(AMD,-AMD-Radeon(TM)-Vega-3-Graphics-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1650-Ti-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-3050-Laptop-GPU-Direct3D11-vs_5_0-ps_5_0,-D3D11-27.21.14.6262)",
				"ANGLE-(AMD-Radeon-RX-580-2048SP-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-630-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA-GeForce-920MX-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-950M-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-2080-SUPER-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel(R)-HD-Graphics-4600-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1050-Direct3D11-vs_5_0-ps_5_0,-D3D11-27.21.14.5638)",
				"ANGLE-(Intel,-Intel(R)-Iris(R)-Xe-Graphics-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-4600-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-530-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1060-3GB-Direct3D11-vs_5_0-ps_5_0,-D3D11-27.21.14.5671)",
				"ANGLE-(NVIDIA-GeForce-RTX-3060-Ti-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-2060-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-3070-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD,-AMD-Radeon-RX-6800-XT-Direct3D11-vs_5_0-ps_5_0,-D3D11-30.0.15021.1001)",
				"ANGLE-(NVIDIA,-NVIDIA-GRID-K280Q-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1660-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-4600-Direct3D11-vs_5_0-ps_5_0,-D3D11-20.19.15.4835)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-2070-SUPER-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel,-Intel(R)-UHD-Graphics-620-Direct3D11-vs_5_0-ps_5_0,-D3D11-27.20.100.8854)",
				"ANGLE-(NVIDIA,-NVIDIA-Quadro-RTX-4000-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-610M-Direct3D11-vs_5_0-ps_5_0,-D3D11-23.21.13.9135)",
				"ANGLE-(NVIDIA-GeForce-GTX-1650-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(Intel(R)-UHD-Graphics-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(ATI-Technologies-Inc.,-AMD-Radeon-Pro-5500M-OpenGL-Engine,-OpenGL-4.1)",
				"ANGLE-(NVIDIA-GeForce-RTX-3060-Laptop-GPU-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(Intel,-Intel(R)-UHD-Graphics-620-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1650-Ti-with-Max-Q-Design-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-605-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel(R)-HD-Graphics-4000-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(NVIDIA,-NVIDIA-Quadro-RTX-4000-Direct3D11-vs_5_0-ps_5_0,-D3D11-30.0.15.1179)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-960-Direct3D11-vs_5_0-ps_5_0,-D3D11-30.0.15.1215)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-4000-Direct3D11-vs_5_0-ps_5_0,-D3D11-10.18.10.5161)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-3000-Direct3D11-vs_4_1-ps_4_1,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1060-6GB-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD-Radeon-RX-6500-XT-Direct3D9Ex-vs_3_0-ps_3_0)",
				"ANGLE-(NVIDIA-GeForce-GTX-960-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-750-Ti-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-520-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GT-730-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD-Radeon(TM)-R5-340X-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(AMD,-Radeon-520-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD,-Radeon-RX-560-Series-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1060-6GB-Direct3D11-vs_5_0-ps_5_0,-D3D11-27.21.14.6079)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1070-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-GTX-1060-3GB-Direct3D11-vs_5_0-ps_5_0,-D3D11-30.0.15.1215)",
				"ANGLE-(AMD-Radeon(TM)-Vega-3-Graphics-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(AMD,-AMD-Radeon-RX-580-2048SP-Direct3D11-vs_5_0-ps_5_0,-D3D11-30.0.15002.1004)",
				"ANGLE-(Intel,-Intel(R)-HD-Graphics-610-Direct3D11-vs_5_0-ps_5_0,-D3D11-27.20.100.8681)",
				"ANGLE-(NVIDIA-Corporation,-GeForce-RTX-3090/PCIe/SSE2,-OpenGL-4.5.0-NVIDIA-460.91.03)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-3050-Ti-Laptop-GPU-Direct3D11-vs_5_0-ps_5_0,-D3D11-30.0.14.7219)",
				"ANGLE-(NVIDIA-GeForce-GT-710-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-2060-SUPER-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(AMD,-Radeon(TM)-RX-460-Graphics-Direct3D11-vs_5_0-ps_5_0,-D3D11)",
				"ANGLE-(NVIDIA-GeForce-RTX-3050-Direct3D11-vs_5_0-ps_5_0)",
				"ANGLE-(NVIDIA,-NVIDIA-GeForce-RTX-3050-Direct3D11-vs_5_0-ps_5_0,-D3D11)"
			])//"ANGLE (" + gpuStr + " " + addDirectX + ")";
		},

		ChooseUserAgent:function(){
			Vars.useragent = rA([
				"Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.44",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.44",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 Edg/100.0.1185.44",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.4976.0 Safari/537.36 Edg/102.0.1227.0",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Agency/92.8.6637.38",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 AtContent/94.5.6504.5",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Agency/100.8.6707.8",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.88",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Config/92.2.3261.62",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/7vdq8CtK-01",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqNiKuL-34",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqY1SuL-72",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqPtVuL-9",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqNJauL-25",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqXoXuL-32",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqEzXuL-46",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/1laB5WpH-43",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqLkJuL-86",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/7rpJ8CqK-00",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/3ksI6CtQ-58",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqPaQuL-91",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/9uiP7EnX-09",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqLqMuL-37",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqQaZuL-16",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqDoRuL-01",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqNiKuL-99",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/10csO9CgK-99",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8vfJ8dsw-50",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 LikeWise/92.6.5045.46",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 AtContent/91.5.6864.65",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 OpenWave/97.4.9413.14",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.34",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39/8mqNJauL-25",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36 Edg/99.0.1150.46/FclZU0jz-34",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 OpenWave/93.4.9303.4",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 GLS/97.10.6839.40",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/2kcL6ZrR-71",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 AtContent/92.5.3444.45",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 AtContent/90.5.8184.85",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.4976.0 Safari/537.36 Edg/102.0.1225.0",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.100.1185.39 Safari/537.36 Edg/99.100.1185.39",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4501.0 Safari/537.36 Edg/91.0.866.0",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Agency/90.8.7607.8",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Agency/95.8.2477.78",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Unique/100.7.2656.57",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 GLS/90.10.3229.30",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.51",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.94",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36,gzip(gfe)",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4679.0 Safari/537.36 Edg/94.0.992.38",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 AtContent/96.5.9994.95",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 AtContent/99.5.1304.5",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Herring/91.1.2330.31",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 Config/98.2.1221.22",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 LikeWise/97.6.8855.56",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 Viewer/93.9.4108.9",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 AtContent/97.5.7194.95",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/8mqMlPuL-96",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/lszoZFU6wzgiQNFn1",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 OpenWave/90.4.5303.4",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 GLS/100.10.8899.100",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 GLS/97.10.2959.60",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39/9k741mxR-27",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.4963.0 Safari/537.36 Edg/102.0.1220.1",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 AtContent/98.5.5924.25",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Config/98.2.4481.82",
				"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36 Edg/99.0.1150.46 Unique/92.7.1176.77",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.29",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 LikeWise/99.6.2995.96",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 GLS/91.10.5019.20",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4670.0 Safari/537.36 Edg/98.0.1108.43",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.4972.0 Safari/537.36 Edg/102.0.1224.0",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.29 Unique/93.7.3646.47",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.29 AtContent/93.5.6094.95",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Trailer/96.3.1222.23",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/K9RxbuOG-24",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 GLS/97.10.2599.100",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Config/100.2.6001.2",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 Config/100.2.6001.2",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 Viewer/99.9.6138.39",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 GLS/92.10.8959.60",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/BClWHMY1-36",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36/hL08LCqV-25",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 Trailer/91.3.8382.83",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 Unique/90.7.7086.87",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 LikeWise/90.6.8315.16",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.29;Build/0220;",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 Herring/94.1.8170.71",
				"Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.15 Safari/537.36 Edg/101.0.1210.10",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.26 Safari/537.36 Edg/101.0.1210.14",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 AtContent/91.5.8274.75",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.4972.0 Safari/537.36 Edg/102.0.1223.0",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Viewer/97.9.1128.29",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML%2C like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.39 Agency/91.8.8867.68",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36 OpenWave/98.4.2143.44"
			])
			
			Vars.platform = 'Win64'
			Vars.oscpu = 'Windows NT 10.0; Win64; x64'
			return Vars.useragent
			// If user has enabled custom user agents and set some
			if (Prefs.Current.Pref_UserAgent.uaCust.enabled === true && Prefs.Current.Pref_UserAgent.uaCust.customUAs.length > 0){
				return rA(Prefs.Current.Pref_UserAgent.uaCust.customUAs);
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