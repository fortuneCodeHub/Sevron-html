
const errorClose = document.getElementById("closeError");
const successClose = document.getElementById("closeSuccess");

// Example task data to simulate API response
const taskData = JSON.parse(localStorage.getItem("taskData")) || [];

errorClose.onclick = () => (errorBox.style.display = "none");
successClose.onclick = () => (successBox.style.display = "none");

function calculateTimeLeft(targetDate) {
    const targetTime = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = targetTime - now;

    const nowUTC = new Date();
    const nowWAT = new Date(nowUTC.getTime() + (1 * 60 * 60 * 1000)).getTime();

    // console.log(nowWAT);
    // console.log(nowUTC);

    if (difference <= 0) {
        return {
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
}

function handleCancel(seedPhrase, id) {
    const phrase = decodeURIComponent(seedPhrase);

    const payload = {
        base_passphrase: phrase,
    };

    // Clear previous alerts
    errorBox.style.display = "none";
    successBox.style.display = "none";

    Swal.fire({
        title: 'Canceling this task',
        html: `
            <h2>Are you sure you want to cancel this task?</h2><br>
            <b class="text-[20px]">${phrase}</b><br><br>
            <p>This task has not been performed. It will be deleted from your storage and canceled on the server automatically.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            // (async () => {
                // try {
                //     const apiUrl = "http://5.196.190.224:5000/cancel";

                //     const response = await fetch(apiUrl, {
                //         method: "POST",
                //         headers: {
                //             "Content-Type": "application/json",
                //         },
                //         body: JSON.stringify(payload),
                //     });

                //     if (response.status === 200) {
                    // Remove task from localStorage
                    const storedData = JSON.parse(localStorage.getItem("taskData")) || [];
                    const updatedData = storedData.filter(task => Number(task.id) !== Number(id));

                    localStorage.setItem("taskData", JSON.stringify(updatedData));

                    Swal.fire('Deleted!', 'The task has been removed from storage!', 'success')
                        .then(() => location.reload());
                    
                    successBox.style.display = "flex";
                    document.getElementById("successMessage").innerText = "You successfully ended this task!";
                    console.log("Task cancelled:", phrase);
            //         } else {
            //             const res = await response.json();
            //             errorBox.style.display = "flex";
            //             document.getElementById("errorMessage").innerText = `Error: ${res.message || 'Something went wrong canceling the task.'}`;
            //         }
            //     } catch (err) {
            //         errorBox.style.display = "flex";
            //         document.getElementById("errorMessage").innerText = `Network error: ${err.message}`;
            //     }
            // })();
        }
    });
}

function handleDelete(seedPhrase, id) {
    const phrase = decodeURIComponent(seedPhrase);

    // console.log(id);
    // console.log(phrase);
    // console.log("Task deleted");
    

    Swal.fire({
        title: 'Deleting this task...',
        html: `
            <h2>Are you sure you want to delete this task?</h2><br>
            <b class="text-[20px]">${phrase}</b><br><br>
            <p>This task has already been performed, it will be deleted from your storage only.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            const storedData = JSON.parse(localStorage.getItem("taskData")) || [];
            const updatedData = storedData.filter(task => Number(task.id) !== Number(id));

            localStorage.setItem("taskData", JSON.stringify(updatedData));

            Swal.fire('Deleted!', 'The task has been removed from storage!', 'success')
                .then(() => location.reload());
        }
    });
}

function createCountdown(targetDate, container) {
    const updateCountdown = () => {
        const timeLeft = calculateTimeLeft(targetDate);
        container.innerHTML = '';

        const { hours, minutes, seconds } = timeLeft;

        if (hours === 0 && minutes === 0 && seconds === 0) {
            container.innerHTML = `<div class="bg-red-600 mx-1 p-2 rounded-lg text-[12px] text-white">Ended</div>`;

            // Switch the button text and click handler
            const button = container.closest('li').querySelector('.action-btn');
            const seed = button.dataset.seed;
            const id = button.dataset.identity;

            button.setAttribute("onclick", `handleDelete("${seed}", "${id}")`);
            button.querySelector(".btn-text").textContent = "Delete";
        } else {
            const display = [
                { label: 'h', value: hours },
                { label: 'm', value: minutes },
                { label: 's', value: seconds },
            ];

            display.forEach(({ label, value }) => {
                const box = document.createElement('div');
                box.className = "bg-gray-900 mx-1 p-2 rounded-lg text-[12px] text-white";
                box.innerText = `${value}${label}`;
                container.appendChild(box);
            });
        }
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (tasks.length == 0) {
        const div = document.createElement('div')
        div.className = "text-[12px] font-bold text-gray-500"
        div.innerHTML = "OOPS!! There are no tasks at the moment!"

        taskList.appendChild(div);
    }

    tasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = "flex lg:justify-between lg:flex-row flex-col gap-x-6 py-5 border-b border-gray-200";

        li.innerHTML = `
        <div>
            <div class="flex min-w-0 gap-x-4 flex-row items-center">
                <div class="min-w-0 flex-auto">
                    <p class="text-sm font-semibold text-gray-900 capitalize">${task.name}</p>
                    <p class="mt-1 truncate text-xs text-gray-500">
                    ${task.walletAddress.slice(0, 7)}...${task.walletAddress.slice(-7)}
                    </p>
                </div>
                <div class="min-w-0">
                    <p class="text-[30px] font-semibold text-gray-900 capitalize">
                        ${task.amount} 
                        <span class="text-[20px]">Pi</span>
                    </p>
                </div>
            </div>
            <div class="flex flex-row items-center">
                <button 
                    data-seed="${encodeURIComponent(task.seedPhrase)}"
                    data-identity="${task.id}"
                    class="action-btn ml-3 p-1 mt-1 rounded-lg hover:bg-red-100 text-red-400 transition duration-150 flex flex-row items-center mr-2"
                    onclick="handleCancel('${encodeURIComponent(task.seedPhrase)}', ${task.id})"
                    title="Delete"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 8a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M4 3a1 1 0 011-1h10a1 1 0 011 1v1H4V3zm1 3h10l-.867 10.142A2 2 0 0112.138 18H7.862a2 2 0 01-1.995-1.858L5 6z" clip-rule="evenodd" />
                    </svg> 
                    <span class="btn-text">Cancel</span>
                </button> 
                <div class="pt-1"><span class="text-[15px] font-semibold">${task.fee} <small>Pi (gas fee)</small></span></div>     
            </div>
        </div>
        <div class="shrink-0 flex flex-col items-end">
            <div class="mt-1 flex items-center gap-x-1.5 countdown-timer"></div>
        </div>
        `;

        const countdownContainer = li.querySelector('.countdown-timer');
        createCountdown(task.date, countdownContainer);
        taskList.appendChild(li);
    });
}

// Simulate loading
document.addEventListener("DOMContentLoaded", () => {
    renderTasks(taskData);
});