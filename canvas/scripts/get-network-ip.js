#!/usr/bin/env node

import { networkInterfaces } from "os";

function getNetworkIP() {
	const nets = networkInterfaces();
	const results = {};

	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			if (net.family === "IPv4" && !net.internal) {
				if (!results[name]) {
					results[name] = [];
				}
				results[name].push(net.address);
			}
		}
	}

	const interfaces = Object.keys(results);
	if (interfaces.length === 0) {
		console.log("No network interfaces found");
		return;
	}

	console.log("\n🌐 Network IP addresses for iOS testing:");
	console.log("=====================================");

	for (const [interfaceName, addresses] of Object.entries(results)) {
		console.log(`\n${interfaceName}:`);
		addresses.forEach((addr) => {
			console.log(`  📱 http://${addr}:8080`);
		});
	}

	console.log("\n💡 Use any of these URLs in your iOS device browser");
	console.log("📲 Make sure your iOS device is on the same WiFi network");
	console.log("🔧 Eruda debug panel will appear automatically in development mode\n");
}

getNetworkIP();
