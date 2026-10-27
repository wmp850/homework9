// Homework 9: Dynamic jQuery Interactivity, Events, and DOM Manipulation

$(document).ready(function () {
    // -------------------- STEP 1: Skills array, validation, add/edit/remove --------------------
    // This array is the main source of truth for the skills shown on the page.
    let skills = [
        "Technical Troubleshooting",
        "Customer Service",
        "Problem Solving",
        "Broadband Installation",
        "Technical Documentation"
    ];
    let editingIndex = null;

    const $skillForm = $("#skillForm");
    const $skillInput = $("#skillInput");
    const $skillsList = $("#skillsList");
    const $skillMessage = $("#skillMessage");
    const $skillSubmit = $("#skillSubmit");
    const $cancelEdit = $("#cancelEdit");

    // Higher-order function: accepts a callback that checks each skill.
    function skillExists(skillName, callback) {
        return skills.some(function (skill, index) {
            return callback(skill, index, skillName);
        });
    }

    function showSkillMessage(message, isError) {
        $skillMessage.text(message);
        $skillMessage.toggleClass("text-danger", Boolean(isError));
        $skillMessage.toggleClass("text-success", !isError);
    }

    // Rebuild the list with jQuery DOM methods and attach edit/remove actions.
    function renderSkills() {
        $skillsList.empty();

        skills.forEach(function (skill, index) {
            const $item = $("<li>").addClass("list-group-item d-flex justify-content-between align-items-center gap-2");
            const $editButton = $("<button>")
                .attr({ type: "button", "aria-label": "Edit " + skill })
                .addClass("btn btn-link text-start p-0 flex-grow-1 skill-edit")
                .text(skill)
                .on("click", function () {
                    $skillInput.val(skill).trigger("focus");
                    editingIndex = index;
                    $skillSubmit.text("Save Changes");
                    $cancelEdit.removeClass("d-none");
                    showSkillMessage("Editing: " + skill, false);
                });

            const $removeButton = $("<button>")
                .attr({ type: "button", "aria-label": "Remove " + skill })
                .addClass("btn btn-sm btn-outline-danger")
                .text("Remove")
                .on("click", function () {
                    // Animate the item first, then update the array in the callback.
                    $item.slideUp(200, function () {
                        skills.splice(index, 1);
                        if (editingIndex === index) resetSkillForm();
                        else if (editingIndex !== null && index < editingIndex) editingIndex--;
                        renderSkills();
                        showSkillMessage('Removed "' + skill + '".', false);
                    });
                });

            $item.append($editButton, $removeButton).hide();
            $skillsList.append($item);
            $item.fadeIn(250);
        });
    }

    function resetSkillForm() {
        editingIndex = null;
        $skillForm[0].reset();
        $skillSubmit.text("Add Skill");
        $cancelEdit.addClass("d-none");
    }

    function addOrUpdateSkill() {
        const newSkill = $skillInput.val().trim();
        if (newSkill === "") {
            showSkillMessage("Please enter a skill first.", true);
            $skillInput.trigger("focus");
            return;
        }

        const duplicate = skillExists(newSkill, function (existingSkill, index, enteredSkill) {
            // While editing, allow the skill to keep its own current name.
            return index !== editingIndex && existingSkill.toLowerCase() === enteredSkill.toLowerCase();
        });

        if (duplicate) {
            showSkillMessage("That skill is already on the list.", true);
            $skillInput.trigger("focus");
            return;
        }

        if (editingIndex !== null) {
            const oldSkill = skills[editingIndex];
            skills[editingIndex] = newSkill;
            showSkillMessage('Updated "' + oldSkill + '" to "' + newSkill + '".', false);
        } else {
            skills.push(newSkill);
            showSkillMessage('Added "' + newSkill + '" to your skills.', false);
        }

        resetSkillForm();
        renderSkills();
        $skillInput.trigger("focus");
    }

    // Callback used when the form is submitted by button or Enter key.
    $skillForm.on("submit", function (event) {
        event.preventDefault();
        addOrUpdateSkill();
    });

    $cancelEdit.on("click", function () {
        resetSkillForm();
        showSkillMessage("Edit cancelled.", false);
    });

    // Step 4: keyboard events are bound to the input field.
    $skillInput.on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addOrUpdateSkill();
        } else if (event.key === "Escape") {
            // Clear every input in the skill form and exit edit mode.
            $skillForm.find("input").val("");
            resetSkillForm();
            showSkillMessage("Input cleared.", false);
        }
    });

    renderSkills();

    // -------------------- STEP 2: Render navigation from an array --------------------
    const navigationItems = [
        { label: "Who I Am", target: "#about" },
        { label: "Education", target: "#education" },
        { label: "Experience", target: "#experience" },
        { label: "Skills", target: "#skills" },
        { label: "Projects", target: "#projects" },
        { label: "Contact", target: "#contact" }
    ];

    const $navigation = $("#dynamicNav");
    navigationItems.forEach(function (item, index) {
        const $link = $("<a>")
            .addClass("nav-link px-3")
            .attr("href", item.target)
            .text(item.label)
            .on("click", function (event) {
                event.preventDefault();
                const $section = $(item.target);
                if ($section.length) {
                    $("html, body").stop().animate({ scrollTop: $section.offset().top - 80 }, 500);
                    $("#dynamicNav .nav-link").removeClass("active");
                    $(this).addClass("active");
                    // Close the mobile navigation after choosing a section.
                    $("#portfolioNav").collapse("hide");
                }
            });
        if (index === 0) $link.addClass("active");
        $navigation.append($("<li>").addClass("nav-item").append($link));
    });

    // -------------------- STEP 3: Projects array, cards, images, and sorting --------------------
    const projects = [
        {
            title: "Portfolio Website",
            description: "A responsive personal website built with HTML, CSS, Bootstrap, and JavaScript.",
            deadline: new Date("2026-09-15T00:00:00"),
            imageURL: "app.jpg"
        },
        {
            title: "JavaScript Interactivity Practice",
            description: "Practice using arrays, forms, event listeners, and DOM updates in a portfolio.",
            deadline: new Date("2026-12-15T00:00:00"),
            imageURL: "ai.jpg"
        },
        {
            title: "Game Design Exploration",
            description: "An early-stage project interest focused on learning game design and development.",
            deadline: new Date("2027-05-01T00:00:00"),
            imageURL: "game.jpg"
        }
    ];

    function renderProjects(sortOrder) {
        // Comparator sorts the project array by its Date object.
        projects.sort(function (projectA, projectB) {
            return sortOrder === "latest"
                ? projectB.deadline - projectA.deadline
                : projectA.deadline - projectB.deadline;
        });

        const $projectList = $("#projectList").empty();
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            const deadlineText = project.deadline.toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
            });
            const $image = $("<img>")
                .attr({ src: project.imageURL, alt: project.title + " project image" })
                .addClass("card-img-top project-image");
            const $title = $("<h3>").addClass("h5 card-title fw-bold").text(project.title);
            const $description = $("<p>").addClass("card-text body-font flex-grow-1").text(project.description);
            const $deadline = $("<p>").addClass("mb-0 small").text("Deadline: " + deadlineText);
            const $body = $("<div>").addClass("card-body d-flex flex-column").append($title, $description, $deadline);
            const $card = $("<article>").addClass("card h-100 shadow-sm hover-card").append($image, $body);
            const $column = $("<div>").addClass("col-12 col-md-6 col-xl-4").append($card).hide();
            $projectList.append($column);
            $column.fadeIn(250);
        }
    }

    $("#projectSort").on("change", function () {
        renderProjects($(this).val());
    });
    renderProjects($("#projectSort").val());

    // -------------------- Existing Homework 8 features retained --------------------
    let resumeDownloadCount = 0;
    $("#downloadBtn").on("click", function () {
        // The browser's normal download action is not prevented.
        resumeDownloadCount++;
        $("#downloadCount").text(resumeDownloadCount);
    });

    const educationEntries = [
        { school: "Northern Arizona University", degree: "Bachelor of Science in Computer Science", start: "2026", end: "Present", status: "In Progress" },
        { school: "Coconino Community College", degree: "Associate's Degree in General Studies - Science", start: "Completed", end: "2026", status: "Completed" },
        { school: "Coconino High School", degree: "High School Diploma", start: "Completed", end: "Completed", status: "Completed" }
    ];

    const experienceEntries = [
        { company: "Dish/EchoStar", role: "Remote Field Technician", start: "May 2026", end: "Present" },
        { company: "NovaKinetics Aerosystems", role: "Composite Technician", start: "Jan 2024", end: "Feb 2026" },
        { company: "TriState Communications", role: "Cable Technician", start: "Aug 2021", end: "Dec 2023" },
        { company: "Legacy Beverage / Kalil Bottling Co.", role: "Merchandiser", start: "Apr 2020", end: "Jul 2021" },
        { company: "Arizona Central Credit Union", role: "Teller", start: "Jul 2017", end: "Jun 2018" }
    ];

    function createDataTable(containerId, headings, entries, keys) {
        const $table = $("<table>").addClass("table table-hover table-striped align-middle border");
        const $thead = $("<thead>").addClass("table-secondary text-uppercase font-xs");
        const $headerRow = $("<tr>");
        headings.forEach(function (heading) {
            $headerRow.append($("<th>").attr("scope", "col").text(heading));
        });
        $thead.append($headerRow);
        const $tbody = $("<tbody>").addClass("body-font text-secondary");
        entries.forEach(function (entry) {
            const $row = $("<tr>");
            keys.forEach(function (key) {
                $row.append($("<td>").text(entry[key]));
            });
            $tbody.append($row);
        });
        $table.append($thead, $tbody);
        $("#" + containerId).empty().append($table);
    }

    createDataTable("educationTable", ["School / University", "Degree", "Start Date", "End Date", "Status"], educationEntries,
        ["school", "degree", "start", "end", "status"]);
    createDataTable("experienceTable", ["Company", "Job Title / Role", "Start Date", "End Date"], experienceEntries,
        ["company", "role", "start", "end"]);

    let darkThemeEnabled = false;
    $("#themeToggle").on("click", function () {
        darkThemeEnabled = !darkThemeEnabled;
        $("body").toggleClass("dark-theme", darkThemeEnabled);
        $(this).text(darkThemeEnabled ? "Switch to Light Theme" : "Switch to Dark Theme");
    });

    $("#fontSizeInput").on("change", function () {
        $("body").css("font-size", $(this).val());
    });

    $("#backgroundInput").on("input", function () {
        if (!darkThemeEnabled) $("body").css("background-color", $(this).val());
    });

    // Keep the greeting feature from Homework 8, if its container is present.
    const greeting = $("#greetingContainer");
    if (greeting.length) {
        const hour = new Date().getHours();
        let greetingText = "Good evening";
        if (hour < 12) greetingText = "Good morning";
        else if (hour < 18) greetingText = "Good afternoon";
        greeting.text(greetingText + "! Welcome to my portfolio.");
    }
});
