export function nsisConfig() {
    if (process.platform === 'darwin') {
        return {}
    }
    else {
        return {
            icon: "../resource/unrelease/icon.ico",
            target: [
                {
                    target: "nsis",
                    arch: ["ia32"],
                },
            ],
            sign: async (config) => {
                // 应用签名逻辑后面详细介绍
            }
        }
    }
}