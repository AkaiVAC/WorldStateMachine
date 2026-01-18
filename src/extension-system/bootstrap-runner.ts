import { bootstrapExtensions } from "./bootstrap";

const runBootstrap = async () => {
    await bootstrapExtensions(process.cwd());
};

runBootstrap().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
