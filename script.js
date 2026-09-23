// ===============================
// INITIAL DATA
// ===============================

let users = JSON.parse(localStorage.getItem("users")) || [];

let campaigns =
    JSON.parse(localStorage.getItem("campaigns")) || [
        {
            id: 1,
            title: "Education for Poor Children",
            description: "Help provide education and books for children.",
            target: 50000,
            raised: 15000,
            deadline: "2026-12-30",
            status: "Approved",
            creator: "Admin"
        },
        {
            id: 2,
            title: "Medical Support",
            description: "Support medical treatment for needy families.",
            target: 100000,
            raised: 35000,
            deadline: "2026-11-20",
            status: "Approved",
            creator: "Admin"
        }
    ];

let donations =
    JSON.parse(localStorage.getItem("donations")) || [];


// ===============================
// PAGE NAVIGATION
// ===============================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    if (pageId === "campaigns") {
        displayCampaigns();
    }

    if (pageId === "adminDashboard") {
        displayAdminDashboard();
    }

    if (pageId === "userDashboard") {
        updateUserDashboard();
    }
}


// ===============================
// SIGNUP
// ===============================

function signup() {

    let name = document.getElementById("signupName").value;
    let email = document.getElementById("signupEmail").value;
    let password = document.getElementById("signupPassword").value;
    let role = document.getElementById("signupRole").value;

    if (!name || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    let existingUser = users.find(user => user.email === email);

    if (existingUser) {
        alert("User already exists.");
        return;
    }

    let newUser = {
        name: name,
        email: email,
        password: password,
        role: role
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");

    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";

    showPage("login");
}


// ===============================
// LOGIN
// ===============================

function login() {

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    let user = users.find(
        user =>
            user.email === email &&
            user.password === password
    );

    // Demo admin login
    if (email === "admin@gmail.com" && password === "admin123") {

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify({
                name: "Administrator",
                email: email,
                role: "admin"
            })
        );

        alert("Admin Login Successful!");

        showPage("adminDashboard");
        return;
    }

    if (!user) {
        alert("Invalid email or password.");
        return;
    }

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(user)
    );

    alert("Login successful!");

    if (user.role === "admin") {
        showPage("adminDashboard");
    } else {
        showPage("userDashboard");
    }
}


// ===============================
// DISPLAY CAMPAIGNS
// ===============================

function displayCampaigns() {

    let container =
        document.getElementById("campaignContainer");

    container.innerHTML = "";

    let approvedCampaigns =
        campaigns.filter(
            campaign => campaign.status === "Approved"
        );

    if (approvedCampaigns.length === 0) {
        container.innerHTML =
            "<p>No campaigns available.</p>";
        return;
    }

    approvedCampaigns.forEach(campaign => {

        let percentage =
            Math.min(
                (campaign.raised / campaign.target) * 100,
                100
            );

        container.innerHTML += `

            <div class="campaign-card">

                <h3>${campaign.title}</h3>

                <p>${campaign.description}</p>

                <p>
                    <strong>Target:</strong>
                    ₹${campaign.target}
                </p>

                <p>
                    <strong>Raised:</strong>
                    ₹${campaign.raised}
                </p>

                <p>
                    <strong>Progress:</strong>
                    ${percentage.toFixed(0)}%
                </p>

                <p>
                    <strong>Deadline:</strong>
                    ${campaign.deadline}
                </p>

                <button onclick="donate(${campaign.id})">
                    Donate
                </button>

            </div>

        `;
    });
}


// ===============================
// DONATE
// ===============================

function donate(campaignId) {

    let loggedInUser =
        JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("Please login before donating.");
        showPage("login");
        return;
    }

    if (loggedInUser.role === "admin") {
        alert("Admin cannot donate.");
        return;
    }

    let amount =
        prompt("Enter donation amount:");

    amount = Number(amount);

    if (!amount || amount <= 0) {
        alert("Enter a valid amount.");
        return;
    }

    let campaign =
        campaigns.find(
            campaign => campaign.id === campaignId
        );

    if (!campaign) {
        alert("Campaign not found.");
        return;
    }

    campaign.raised += amount;

    donations.push({
        user: loggedInUser.email,
        campaign: campaign.title,
        amount: amount
    });

    localStorage.setItem(
        "campaigns",
        JSON.stringify(campaigns)
    );

    localStorage.setItem(
        "donations",
        JSON.stringify(donations)
    );

    alert("Donation successful!");

    displayCampaigns();
}


// ===============================
// CREATE CAMPAIGN
// ===============================

function createCampaign() {

    let loggedInUser =
        JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("Please login first.");
        showPage("login");
        return;
    }

    let title =
        document.getElementById("campaignTitle").value;

    let description =
        document.getElementById("campaignDescription").value;

    let target =
        Number(
            document.getElementById("campaignTarget").value
        );

    let deadline =
        document.getElementById("campaignDeadline").value;

    if (!title || !description || !target || !deadline) {
        alert("Please fill all fields.");
        return;
    }

    let newCampaign = {

        id: Date.now(),

        title: title,

        description: description,

        target: target,

        raised: 0,

        deadline: deadline,

        status: "Pending",

        creator: loggedInUser.email
    };

    campaigns.push(newCampaign);

    localStorage.setItem(
        "campaigns",
        JSON.stringify(campaigns)
    );

    alert(
        "Campaign created successfully! Waiting for admin approval."
    );

    document.getElementById("campaignTitle").value = "";
    document.getElementById("campaignDescription").value = "";
    document.getElementById("campaignTarget").value = "";
    document.getElementById("campaignDeadline").value = "";

    showPage("userDashboard");
}


// ===============================
// USER DASHBOARD
// ===============================

function updateUserDashboard() {

    let loggedInUser =
        JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        return;
    }

    let myCampaigns =
        campaigns.filter(
            campaign =>
                campaign.creator === loggedInUser.email
        );

    let myDonations =
        donations.filter(
            donation =>
                donation.user === loggedInUser.email
        );

    document.getElementById("myCampaignCount")
        .innerText = myCampaigns.length;

    document.getElementById("myDonationCount")
        .innerText = myDonations.length;
}


// ===============================
// ADMIN DASHBOARD
// ===============================

function displayAdminDashboard() {

    document.getElementById("totalUsers")
        .innerText = users.length;

    document.getElementById("totalCampaigns")
        .innerText = campaigns.length;

    let total =
        donations.reduce(
            (sum, donation) =>
                sum + donation.amount,
            0
        );

    document.getElementById("totalDonations")
        .innerText = "₹" + total;

    let adminContainer =
        document.getElementById("adminCampaigns");

    adminContainer.innerHTML = "";

    campaigns.forEach(campaign => {

        adminContainer.innerHTML += `

            <div class="admin-item">

                <div>
                    <strong>${campaign.title}</strong>
                    <br>
                    Status: ${campaign.status}
                </div>

                <div>

                    <button
                        onclick="approveCampaign(${campaign.id})">
                        Approve
                    </button>

                    <button
                        onclick="rejectCampaign(${campaign.id})">
                        Reject
                    </button>

                </div>

            </div>

        `;
    });
}


// ===============================
// APPROVE CAMPAIGN
// ===============================

function approveCampaign(id) {

    let campaign =
        campaigns.find(
            campaign => campaign.id === id
        );

    if (campaign) {

        campaign.status = "Approved";

        localStorage.setItem(
            "campaigns",
            JSON.stringify(campaigns)
        );

        alert("Campaign approved.");

        displayAdminDashboard();
    }
}


// ===============================
// REJECT CAMPAIGN
// ===============================

function rejectCampaign(id) {

    let campaign =
        campaigns.find(
            campaign => campaign.id === id
        );

    if (campaign) {

        campaign.status = "Rejected";

        localStorage.setItem(
            "campaigns",
            JSON.stringify(campaigns)
        );

        alert("Campaign rejected.");

        displayAdminDashboard();
    }
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("loggedInUser");

    alert("Logged out successfully.");

    showPage("home");
}


// ===============================
// LOAD CAMPAIGNS
// ===============================

displayCampaigns();