const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

module.exports = (serviceName) => {
	const exporter = new JaegerExporter({
		serviceName,
		host: "localhost",
		port: 6832,
	});

	const provider = new NodeTracerProvider({
		resource: new Resource({
			[SemanticResourceAttributes.SERVICE_NAME]: serviceName,
		}),
	});

	provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
	provider.register();

	registerInstrumentations({
		instrumentations: [
			new ExpressInstrumentation(),
			new MongoDBInstrumentation(),
			new HttpInstrumentation(),
		],
	});

	return trace.getTracer(serviceName);
};
