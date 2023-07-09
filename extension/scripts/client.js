class Client {
    // be sure this matches host_permissions in manifest.json
    static base_url = "http://localhost:8080"; 

    static async getAuthentication() {
        return (await chrome.storage.sync.get('token'))['token'];
    }

    static async get(endpoint, params, options = {}) {
        const URLparams = new URLSearchParams();
        for(let param in params) {
            URLparams.append(param, params[param]);
        }
        const token = await Client.getAuthentication();

        const headers = {
            'x-access-token': token
            // 'Content-Type': 'application/json',
        };
        console.log(`${this.base_url}/${endpoint}?${URLparams.toString()}`);

        const response = await fetch(`${this.base_url}/${endpoint}?${URLparams.toString()}`,
                               { headers, ...options });

        if(!response.ok) {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
            throw "Login required";
        }

        return await response.json();
    }

    static async post(endpoint, body, options = {}) {
        const token = await Client.getAuthentication();
        
        const headers = {
            'Content-Type': 'application/json',
            'x-access-token': token
        };

        const response = await fetch(`${this.base_url}/${endpoint}`,
                                { headers, body: JSON.stringify(body), method: "POST", ...options });

        if(!response.ok) {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
            throw "Login required";
        }

        return await response.json();
    }

    static async delete(endpoint, options = {}) {
        const token = await Client.getAuthentication();
        
        const headers = {
            'Content-Type': 'application/json',
            'x-access-token': token
        };

        const response = await fetch(`${this.base_url}/${endpoint}`,
                                { headers, method: "DELETE", ...options });

        console.log(response);
        if(!response.ok) {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
            throw "Login required";
        }

        return await response.json();
    }

    static async postNonAuth(endpoint, body, options = {}) {

        const headers = {
            'Content-Type': 'application/json',
        };

        return await fetch(`${this.base_url}/${endpoint}`,
                                { headers, body: JSON.stringify(body), method: "POST", ...options });
    }

    static async getUsername() {
        return (await chrome.storage.sync.get("username"))["username"];
    }
}
