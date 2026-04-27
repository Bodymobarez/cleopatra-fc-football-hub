const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	// SDK auth reads/writes `base44_access_token`; keep that key for access_token only.
	const storageKey =
		paramName === 'access_token'
			? 'base44_access_token'
			: `ceramica_cleopatra_${toSnakeCase(paramName)}`;
	const legacyStorageKey =
		paramName === 'access_token' ? null : `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue =
		storage.getItem(storageKey) ||
		(legacyStorageKey ? storage.getItem(legacyStorageKey) : null);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	const envAppId = import.meta.env.VITE_CERAMICA_CLEOPATRA_APP_ID || import.meta.env.VITE_BASE44_APP_ID;
	const envFns = import.meta.env.VITE_CERAMICA_CLEOPATRA_FUNCTIONS_VERSION || import.meta.env.VITE_BASE44_FUNCTIONS_VERSION;
	const envBase = import.meta.env.VITE_CERAMICA_CLEOPATRA_APP_BASE_URL || import.meta.env.VITE_BASE44_APP_BASE_URL;
	return {
		appId: getAppParamValue("app_id", { defaultValue: envAppId }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: envFns }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: envBase }),
	}
}


export const appParams = {
	...getAppParams()
}
