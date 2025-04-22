
document.addEventListener("DOMContentLoaded", function () {

    // This code handles the form display
    const createTaskSection = document.querySelector(".form-bg");
    const activeTaskNotice = document.createElement("div");
    activeTaskNotice.className = "text-center p-10 text-xl text-gray-600 font-medium hidden";
    activeTaskNotice.innerHTML = `
        <div class="flex flex-col items-center justify-center space-y-4">
            <img src="assets/images/oops.png" alt="Oops!" class="w-[300px] h-[300px]">
            <span>A task is already in progress. Please wait for it to complete before creating a new one.</span><br>
            <a href="/taskbar.html" class="text-[#0f0c29] border border-[#0f0c29] hover:text-white hover:bg-[#0f0c29] py-3 px-6 rounded-lg">
                Taskbar
            </a>
        </div>
    `;
    createTaskSection.parentElement.insertBefore(activeTaskNotice, createTaskSection);

    let loading = false;

    function loadingFunction(boolean) {
        const loader = document.querySelector(".loading")
    
        if (loading) {
            loader.innerText = "Loading..."
        } else {
            loader.innerText = "Create"
        }
    }

    // Check if there's an active countdown task
    const taskDataRaw = localStorage.getItem("taskData");
    if (taskDataRaw) {
        const taskData = JSON.parse(taskDataRaw);

        const now = new Date().getTime();
        const hasActiveTask = taskData.some(task => {
            const startTime = new Date(task.date).getTime();
            return startTime > now;
        });

        if (hasActiveTask) {
            // Hide form, show message
            createTaskSection.style.display = "none";
            activeTaskNotice.classList.remove("hidden");
        } else {
            // Show form if no active countdown
            createTaskSection.style.display = "block";
            activeTaskNotice.classList.add("hidden");
        }
    }

    const form = document.getElementById("createTaskForm");
    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");
    const errorClose = document.getElementById("closeError");
    const successClose = document.getElementById("closeSuccess");

    errorClose.onclick = () => (errorBox.style.display = "none");
    successClose.onclick = () => (successBox.style.display = "none");

    const validateAndFormatData = (formData) => {
        let errors = [];

        // Validate name
        if (typeof formData.name !== "string" || formData.name.trim() === "") {
        errors.push("Name is required.");
        } else {
        formData.name = formData.name.trim();
        }

        // Validate seedPhrase
        if (typeof formData.seedPhrase !== "string" || formData.seedPhrase.trim() === "") {
        errors.push("Seed phrase is required.");
        } else {
        formData.seedPhrase = formData.seedPhrase.trim();
        }

        if (typeof formData.channelPhrase !== "string" || formData.channelPhrase.trim() === "") {
        errors.push("Channel phrase is required.");
        } else {
        formData.channelPhrase = formData.channelPhrase.trim();
        }

        // Validate walletAddress
        if (typeof formData.walletAddress !== "string" || formData.walletAddress.trim() === "") {
        errors.push("Wallet address is required.");
        } else {
        formData.walletAddress = formData.walletAddress.trim();
        }

        // Validate date
        const dateObject = new Date(formData.date);
        if (isNaN(dateObject.getTime())) {
        errors.push("Invalid date format.");
        }

        // Convert amount to a number before validation
        const amount = Number(formData.amount);

        // Validate amount (must be a number and greater than 0)
        if (isNaN(amount) || amount <= 0) {
        errors.push("Amount must be a positive number.");
        }

        const fee = Number(formData.fee);

        // Validate fee (must be a number and greater than 0)
        if (isNaN(fee) || fee <= 0) {
        errors.push("Fee must be a positive number.");
        }

        // Check for errors
        if (errors.length > 0) {
        return errors;
        }

        return true;
    };

    form.onsubmit = async function (e) {
        e.preventDefault();

        loading = true
        loadingFunction(loading)
        

        const loader = document.querySelector(".loading")

        if (loading) {
            loader.innerText = "Loading..."
        } else {
            loader.innerText = "Create"
        }

        // Clear previous alerts
        errorBox.style.display = "none";
        successBox.style.display = "none";

        const dataInStore = JSON.parse(localStorage.getItem("taskData")) || [];

        // Calculate next ID
        const lastId = dataInStore.length > 0 ? dataInStore[dataInStore.length - 1].id : 100000;
        const id = lastId + 1;

        const name = form.name.value;
        const seedPhrase = form.seedPhrase.value;
        const channelPhrase = form.channelPhrase.value;
        const walletAddress = form.walletAddress.value;
        const mainDate = document.getElementById("task-date").value;
        const time = document.getElementById("task-time").value;
        const amount = form.amount.value;
        const fee = form.fee.value;

        const date = `${mainDate}T${time}`; // ISO 8601 format

        const formData = {
            id,
            name,
            seedPhrase,
            channelPhrase,
            walletAddress,
            date,
            amount,
            fee,
        };

        const validationResult = validateAndFormatData(formData);

        console.log(validationResult);
        console.log(formData);
        

        if (validationResult !== true) {
            errorBox.style.display = "flex";
            document.getElementById("errorMessage").innerText = validationResult.join("\n");
            return;
        }

        // Prepare API payload
        const payload = {
            target_time: time,
            base_passphrase: formData.seedPhrase,
            channel_passphrase: formData.channelPhrase,
            withdrawal_amount: formData.amount,
            withdrawal_fee: formData.fee,
            destination_address: formData.walletAddress,
        };

        console.log([payload]);

        try {
            // Replace this with your actual base URL
            const apiUrl = "http://5.196.190.224:5000/schedule";

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 200) {
                const storedData = JSON.parse(localStorage.getItem("taskData")) || [];
                storedData.push(formData);
                localStorage.setItem("taskData", JSON.stringify(storedData));

                // Show success
                successBox.style.display = "flex";
                document.getElementById("successMessage").innerText = "Task saved and scheduled successfully!";

                loading = false
                loadingFunction(loading)

                form.reset();
                setTimeout(() => {
                    window.location.assign("taskbar.html");
                }, 5000)
            } else if (response.status === 400) {
                loading = false
                loadingFunction(loading)
                
                errorBox.style.display = "flex";
                document.getElementById("errorMessage").innerText = `Error: No claimable balance for account provided`;
            } else {
                loading = false
                loadingFunction(loading)

                errorBox.style.display = "flex";
                document.getElementById("errorMessage").innerText = `Error: You can't schedule a task when one another task has been scheduled`;
            }
        } catch (err) {
            loading = false
            loadingFunction(loading)

            errorBox.style.display = "flex";
            document.getElementById("errorMessage").innerText = `Network error: Please connect to the internet before you can create a task`;
        }
    };

});