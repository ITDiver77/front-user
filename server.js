import express from "express";
import si from "systeminformation";

const app = express();
const PORT = 3001;

// Health endpoint - returns CPU and memory usage
app.get("/api/health", async (req, res) => {
	try {
		const [cpuData, memData] = await Promise.all([si.currentLoad(), si.mem()]);

		const response = {
			status: "ok",
			cpu_percent: Math.round(cpuData.currentLoad * 100) / 100,
			memory_percent: Math.round((memData.used / memData.total) * 10000) / 100,
		};

		res.json(response);
	} catch (error) {
		console.error("Health check failed:", error);
		res.status(500).json({
			status: "error",
			error: error.message,
		});
	}
});

// Liveness probe
app.get("/health/live", (req, res) => {
	res.json({ status: "ok" });
});

// Readiness probe
app.get("/health/ready", (req, res) => {
	res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Health server running on port ${PORT}`);
});
