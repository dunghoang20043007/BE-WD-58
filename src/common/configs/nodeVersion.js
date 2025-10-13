import { NODE_ENV } from "./environment.js";
import semver from "semver";

export function checkVersion() {
    const requiredVersion = ">=20.0.0";
    const currentVersion = process.version;

    if (NODE_ENV === "development" && !semver.satisfies(currentVersion, requiredVersion)) {
        console.error(
            `\x1b[31mNode.js version ${currentVersion} không đạt yêu cầu. Cần phiên bản ${requiredVersion}.\x1b[0m`,
        );
        process.exit(1);
    }
}
