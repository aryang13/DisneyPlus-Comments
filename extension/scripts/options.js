const sign_in_div = document.getElementById("sign-in");
const register_div = document.getElementById("register");
const profile_div = document.getElementById("profile");
const profile_image = document.getElementById("p-img");

function showRegister() {
    document.querySelectorAll("#register input").forEach(x => x.value = "");
    sign_in_div.hidden = true;
    profile_div.hidden = true;
    register_div.hidden = false;
}

function showSignIn() {
    document.getElementById("si-password").value = "";
    profile_div.hidden = true;
    register_div.hidden = true;
    sign_in_div.hidden = false;
}

function showProfile() {
    register_div.hidden = true;
    sign_in_div.hidden = true;
    profile_div.hidden = false;
}

async function getProfile() {
    let response;
    try {
        response = await Client.get("user/profile");;
    } catch {
        signOut();
        return;
    }
    const {username, firstname, lastname, image} = response;

    chrome.storage.sync.set({username});

    if(image) {
        profile_image.src = Images.toImage(image);
    }

    document.getElementById("p-username").innerText = username;
    document.getElementById("p-name").innerText = `${firstname} ${lastname}`;

    showProfile();
}

function setToken(token) {
    chrome.storage.sync.set(
        { token },
        getProfile
      );
}

async function signIn() {
    const eInput = document.getElementById("si-email");
    const pInput = document.getElementById("si-password");
    const message = document.getElementById("si-message");

    message.innerText = "";
    console.log({email: eInput.value, password: pInput.value});

    const response = await Client.postNonAuth("user/login", {email: eInput.value, password: pInput.value});
    console.log(response);
    console.log(response.ok);
    if(!response.ok) {
        console.log("hello");
        message.innerText = (await response.json())['error'];
        return;
    }
    const body = await response.json();

    setToken(body.token);
}

function signOut() {
    chrome.storage.sync.remove(["token", "username"]);
    showSignIn();
}

async function register() {
    const message = document.getElementById("r-message");
    message.innerText = "";

    const registerPayload = {};
    ["username", "password", "email", "firstname", "lastname", "country", "postalcode", "province", "city"].forEach(value => {
        registerPayload[value] = document.getElementById(`r-${value}`).value;
    })

    const response = await Client.postNonAuth("user/register", registerPayload);
    console.log(response);
    if(!response.ok) {
        message.innerText = (await response.json())['error'];
        return;
    }
    const body = await response.json();
    setToken(body.token);
}


document.getElementById("show-register").addEventListener('click', showRegister);
document.getElementById("show-sign-in").addEventListener('click', showSignIn);
document.getElementById("do-sign-in").addEventListener('click', signIn);
document.getElementById("do-register").addEventListener('click', register);
document.getElementById("do-sign-out").addEventListener('click', signOut);
getProfile();


const profileUpload = document.getElementById("p-img-upload");
const profileUploadSubmit = document.getElementById("p-do-img-upload");


profileUploadSubmit.addEventListener("click", async (e) => {
    file = profileUpload.files[0];
    const base64 = await Images.convertBase64(file).then(Images.resizeBase64Img);
    profile_image.src = base64;

    Client.post("user/image", {imagedata: base64});
});