import { globalState } from "../global-state";

const settings = {
	password: "",
	// 【修改】将默认值从 30000 (30秒) 改为 300000 (5分钟)
	timeoutWindowBlur: 300000,
	timeoutInteraction: 300000,
};

export type Settings = typeof settings;

let hasInitialized = false;

export const initSettings = async () => {
	// 使用了 Object.assign，它会用加载的数据覆盖默认值，所以新用户会获得5分钟的默认设置，老用户则保留他们自己的设置
	Object.assign(settings, await globalState.plugin.loadData());
	hasInitialized = true;
	return settings;
};

export const getSettings = () => {
	if (hasInitialized) return settings;
	throw new Error("getSettings() called before initSettings() has finished");
};
