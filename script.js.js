// ==========================================
// ATTENDANCE CALCULATOR - script.js
// ==========================================

function calculateAttendance() {

    // Find the attendance textarea
    const textarea =
        document.querySelector("#attendanceData") ||
        document.querySelector("#attendanceText") ||
        document.querySelector("textarea");

    if (!textarea) {
        alert("Attendance data box পাওয়া যাচ্ছে না!");
        return;
    }

    const data = textarea.value.trim();

    if (!data) {
        alert("আগে ERP Attendance Data paste করুন!");
        return;
    }

    // ==========================================
    // Find Attendance Records
    // Format:
    // 56 23/07/2026 2 10:36 11:40 CSEL30302MJ Present
    // ==========================================

    const pattern =
        /\b\d+\s+\d{1,2}\/\d{1,2}\/\d{4}\s+\d+\s+\d{1,2}:\d{2}\s+\d{1,2}:\d{2}\s+([A-Za-z0-9-]+)\s+(Present|Absent)\b/gi;

    const records = [];
    let match;

    while ((match = pattern.exec(data)) !== null) {

        const subject = match[1].trim().toUpperCase();
        const status = match[2].trim().toLowerCase();

        records.push({
            subject: subject,
            status: status
        });
    }

    // ==========================================
    // If normal pattern doesn't work,
    // try line-by-line parsing
    // ==========================================

    if (records.length === 0) {

        const lines = data
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        for (let i = 0; i < lines.length; i++) {

            const line = lines[i];

            if (/^(Present|Absent)$/i.test(line)) {

                const status = line.toLowerCase();

                // Search previous lines for subject code
                for (let j = i - 1; j >= Math.max(0, i - 6); j--) {

                    const subjectMatch =
                        lines[j].match(/\b[A-Z]{2,}\d+[A-Z0-9-]*\b/i);

                    if (subjectMatch) {

                        records.push({
                            subject: subjectMatch[0].toUpperCase(),
                            status: status
                        });

                        break;
                    }
                }
            }
        }
    }

    // ==========================================
    // No data found
    // ==========================================

    if (records.length === 0) {

        alert(
            "Attendance data পড়তে পারছি না।\n\n" +
            "ERP থেকে পুরো attendance table copy করে আবার paste করুন।"
        );

        return;
    }

    // ==========================================
    // Overall Attendance
    // ==========================================

    const total = records.length;

    const present = records.filter(
        r => r.status === "present"
    ).length;

    const absent = records.filter(
        r => r.status === "absent"
    ).length;

    const percentage =
        total > 0
            ? ((present / total) * 100).toFixed(2)
            : "0.00";

    // ==========================================
    // Update Overall Result
    // ==========================================

    updateElement(
        ["totalClasses", "total", "totalCount"],
        total
    );

    updateElement(
        ["presentCount", "present", "presentClasses"],
        present
    );

    updateElement(
        ["absentCount", "absent", "absentClasses"],
        absent
    );

    updateElement(
        ["attendancePercentage", "percentage", "attendancePercent"],
        percentage + "%"
    );

    // ==========================================
    // Eligibility
    // ==========================================

    const eligibility =
        document.querySelector("#eligibility") ||
        document.querySelector("#eligibilityMessage") ||
        document.querySelector(".eligibility");

    if (eligibility) {

        if (percentage >= 75) {

            eligibility.innerHTML =
                "✅ Eligible — Attendance is 75% or above";

        } else {

            eligibility.innerHTML =
                "❌ Not Eligible — Attendance is below 75%";
        }
    }

    // ==========================================
    // SUBJECT-WISE CALCULATION
    // ==========================================

    const subjects = {};

    records.forEach(record => {

        if (!subjects[record.subject]) {

            subjects[record.subject] = {
                present: 0,
                absent: 0
            };
        }

        if (record.status === "present") {

            subjects[record.subject].present++;

        } else if (record.status === "absent") {

            subjects[record.subject].absent++;
        }
    });

    // ==========================================
    // Find Subject Table
    // ==========================================

    let tableBody =
        document.querySelector("#subjectTableBody") ||
        document.querySelector("#subjectBody") ||
        document.querySelector("#subjectWiseBody") ||
        document.querySelector(".subject-table-body");

    // If tbody doesn't exist, create one
    if (!tableBody) {

        const tables = document.querySelectorAll("table");

        let subjectTable = tables[tables.length - 1];

        if (subjectTable) {

            tableBody = subjectTable.querySelector("tbody");

            if (!tableBody) {

                tableBody = document.createElement("tbody");

                subjectTable.appendChild(tableBody);
            }
        }
    }

    // ==========================================
    // Display Subject-wise Attendance
    // ==========================================

    if (tableBody) {

        tableBody.innerHTML = "";

        Object.keys(subjects).forEach(subject => {

            const p = subjects[subject].present;
            const a = subjects[subject].absent;
            const t = p + a;

            const percent =
                t > 0
                    ? ((p / t) * 100).toFixed(2)
                    : "0.00";

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${subject}</td>
                <td>${p}</td>
                <td>${a}</td>
                <td>${t}</td>
                <td>${percent}%</td>
            `;

            tableBody.appendChild(row);
        });

    } else {

        // ==========================================
        // If table not found, create Subject Table
        // ==========================================

        createSubjectTable(subjects);
    }

    console.log("Total Records:", total);
    console.log("Present:", present);
    console.log("Absent:", absent);
    console.log("Subject-wise:", subjects);
}


// ==========================================
// UPDATE ELEMENT
// ==========================================

function updateElement(ids, value) {

    for (const id of ids) {

        const element = document.getElementById(id);

        if (element) {

            element.textContent = value;
            return;
        }
    }
}


// ==========================================
// CREATE SUBJECT TABLE IF NEEDED
// ==========================================

function createSubjectTable(subjects) {

    const headings = Array.from(
        document.querySelectorAll("h1, h2, h3, h4")
    );

    let heading = headings.find(
        h => h.textContent.toLowerCase().includes("subject")
    );

    const table = document.createElement("table");

    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "15px";

    table.innerHTML = `
        <thead>
            <tr>
                <th>Subject</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Total</th>
                <th>%</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    if (heading) {

        heading.parentNode.appendChild(table);

    } else {

        document.body.appendChild(table);
    }

    const tbody = table.querySelector("tbody");

    Object.keys(subjects).forEach(subject => {

        const p = subjects[subject].present;
        const a = subjects[subject].absent;
        const t = p + a;

        const percent =
            t > 0
                ? ((p / t) * 100).toFixed(2)
                : "0.00";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${subject}</td>
            <td>${p}</td>
            <td>${a}</td>
            <td>${t}</td>
            <td>${percent}%</td>
        `;

        tbody.appendChild(row);
    });
}


// ==========================================
// MAKE FUNCTION AVAILABLE TO HTML
// ==========================================

window.calculateAttendance = calculateAttendance;

const currentPercentage = (present / total) * 100;

let requiredMessage = "";

if (currentPercentage >= 75) {
    requiredMessage = `
        <div class="success-message">
            ✅ You are eligible!<br>
            Your attendance is ${currentPercentage.toFixed(2)}%.<br>
            No more classes required to reach 75%.
        </div>
    `;
} else {
    const classesNeeded = Math.ceil(
        (0.75 * total - present) / 0.25
    );

    requiredMessage = `
        <div class="warning-message">
            ⚠️ Your attendance is below 75%.<br>
            You need to attend <b>${classesNeeded}</b> more classes
            continuously to reach 75%.
        </div>
    `;
}