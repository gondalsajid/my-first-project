// =====================================================
// MONTHLY BILL TRACKER
// FRONTEND JAVASCRIPT
// FILE: script.js
// =====================================================


// =====================================================
// BLOCK 1 — GOOGLE APPS SCRIPT WEB APP URL
// =====================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbxqfe3fWfO8BiC7_2OZk4MhDZjSUcrFRxN-6L9mt8RGYMttsIb_za-bTmlTEogiaTcU/exec";


// =====================================================
// BLOCK 2 — ELEMENTS
// =====================================================

const billMonthInput =
    document.getElementById("billMonth");

const referenceNumberInput =
    document.getElementById("referenceNumber");

const billAmountInput =
    document.getElementById("billAmount");

const statusInput =
    document.getElementById("status");

const paymentDateInput =
    document.getElementById("paymentDate");

const notesInput =
    document.getElementById("notes");

const saveButton =
    document.getElementById("saveButton");

const viewDetailsButton =
    document.getElementById("viewDetailsButton");

const pdfButton =
    document.getElementById("pdfButton");

const reportArea =
    document.getElementById("reportArea");

const reportTitle =
    document.getElementById("reportTitle");

const reportTableContainer =
    document.getElementById("reportTableContainer");

const totalArea =
    document.getElementById("totalArea");


// =====================================================
// BLOCK 3 — SAVE LOCK
// =====================================================

let saveInProgress = false;


// =====================================================
// BLOCK 4 — DEFAULT PAYMENT DATE
// =====================================================

if (
    paymentDateInput &&
    !paymentDateInput.value
) {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    paymentDateInput.value =
        `${year}-${month}-${day}`;
}


// =====================================================
// BLOCK 5 — SHOW MESSAGE
// =====================================================

function showMessage(message) {

    alert(message);

}


// =====================================================
// BLOCK 6 — CHECK API URL
// =====================================================

function checkApiUrl() {

    if (
        !API_URL ||
        API_URL.includes("YOUR_EXISTING")
    ) {

        showMessage(
            "Google Apps Script Web App URL is missing."
        );

        return false;
    }

    return true;
}


// =====================================================
// BLOCK 7 — SAVE DATA
// =====================================================

if (saveButton) {

    saveButton.addEventListener(
        "click",
        async function () {

            if (saveInProgress) {
                return;
            }

            if (!checkApiUrl()) {
                return;
            }

            const billMonth =
                billMonthInput.value.trim();

            const referenceNumber =
                referenceNumberInput.value.trim();

            const billAmount =
                billAmountInput.value.trim();

            const status =
                statusInput.value.trim();

            const paymentDate =
                paymentDateInput.value.trim();

            const notes =
                notesInput.value.trim();


            if (!billMonth) {

                showMessage(
                    "Please select Bill Month."
                );

                return;
            }


            if (!referenceNumber) {

                showMessage(
                    "Please enter Reference Number."
                );

                return;
            }


            saveInProgress = true;

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";


            try {

                const formData =
                    new URLSearchParams();


                formData.append(
                    "action",
                    "save"
                );

                formData.append(
                    "billMonth",
                    billMonth
                );

                formData.append(
                    "referenceNumber",
                    referenceNumber
                );

                formData.append(
                    "billAmount",
                    billAmount
                );

                formData.append(
                    "status",
                    status
                );

                formData.append(
                    "paymentDate",
                    paymentDate
                );

                formData.append(
                    "notes",
                    notes
                );


                const response =
                    await fetch(

                        API_URL,

                        {
                            method: "POST",
                            body: formData
                        }

                    );


                const result =
                    await response.json();


                if (result.success) {

                    showMessage(
                        "Data saved successfully!"
                    );


                    if (
                        reportArea &&
                        reportArea.style.display !== "none"
                    ) {

                        await loadMonthlyReport(
                            billMonth
                        );

                    }

                }

                else if (
                    result.duplicate
                ) {

                    showMessage(
                        "Already saved.\n\nThis Reference Number is already saved for this Bill Month."
                    );

                }

                else {

                    showMessage(
                        result.message ||
                        "Data could not be saved."
                    );

                }

            }

            catch (error) {

                console.error(error);

                showMessage(
                    "Data could not be saved. Please check the Web App deployment."
                );

            }

            finally {

                saveInProgress = false;

                saveButton.disabled = false;

                saveButton.textContent =
                    "Save Data";

            }

        }
    );

}


// =====================================================
// BLOCK 8 — VIEW DETAILS
// =====================================================

if (viewDetailsButton) {

    viewDetailsButton.addEventListener(
        "click",
        async function () {

            if (!checkApiUrl()) {
                return;
            }


            const billMonth =
                billMonthInput.value.trim();


            if (!billMonth) {

                showMessage(
                    "Please select Bill Month."
                );

                return;
            }


            viewDetailsButton.disabled =
                true;

            viewDetailsButton.textContent =
                "Loading...";


            try {

                await loadMonthlyReport(
                    billMonth
                );

            }

            catch (error) {

                console.error(error);

                showMessage(
                    "Could not load the report."
                );

            }

            finally {

                viewDetailsButton.disabled =
                    false;

                viewDetailsButton.textContent =
                    "View Details";

            }

        }
    );

}


// =====================================================
// BLOCK 9 — LOAD MONTHLY REPORT
// =====================================================

async function loadMonthlyReport(
    billMonth
) {

    const url =
        API_URL +
        "?action=view&billMonth=" +
        encodeURIComponent(
            billMonth
        );


    const response =
        await fetch(url);


    const result =
        await response.json();


    if (!result.success) {

        if (reportArea) {

            reportArea.style.display =
                "none";

        }

        showMessage(
            result.message ||
            "No bills found."
        );

        return;
    }


    if (reportTitle) {

        reportTitle.textContent =
            "Monthly Bill Report — " +
            result.billMonth;

    }


    let html = "";

    html +=
        '<table class="report-table">';

    html +=
        "<thead>";

    html +=
        "<tr>";

    html +=
        "<th>Reference Number</th>";

    html +=
        "<th>Bill Amount</th>";

    html +=
        "<th>Status</th>";

    html +=
        "<th>Payment Date</th>";

    html +=
        "<th>Notes</th>";

    html +=
        "</tr>";

    html +=
        "</thead>";

    html +=
        "<tbody>";


    result.bills.forEach(
        function (bill) {

            html += "<tr>";

            html +=
                "<td>" +
                escapeHtml(
                    bill.referenceNumber
                ) +
                "</td>";

            html +=
                "<td>" +
                escapeHtml(
                    bill.billAmount
                ) +
                "</td>";

            html +=
                "<td>" +
                escapeHtml(
                    bill.status
                ) +
                "</td>";

            html +=
                "<td>" +
                escapeHtml(
                    bill.paymentDate
                ) +
                "</td>";

            html +=
                "<td>" +
                escapeHtml(
                    bill.notes
                ) +
                "</td>";

            html += "</tr>";

        }
    );


    html +=
        "</tbody>";

    html +=
        "</table>";


    if (reportTableContainer) {

        reportTableContainer.innerHTML =
            html;

    }


    if (totalArea) {

        totalArea.innerHTML =
            "Total Bills: " +
            result.totalBills +
            "<br>" +
            "Total Amount: " +
            result.totalAmount;

    }


    if (reportArea) {

        reportArea.style.display =
            "block";


        reportArea.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

}


// =====================================================
// BLOCK 10 — ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// BLOCK 11 — CREATE PDF BUTTON
// =====================================================

if (pdfButton) {

    pdfButton.addEventListener(
        "click",
        function () {

            if (!checkApiUrl()) {
                return;
            }


            const billMonth =
                billMonthInput.value.trim();


            if (!billMonth) {

                showMessage(
                    "Please select Bill Month first."
                );

                return;
            }


            // =========================================
            // ASK CUSTOM TITLE
            // =========================================

            const customTitle =
                prompt(

                    "Enter PDF Title:",

                    "Monthly Bill Tracker"

                );


            if (
                customTitle === null
            ) {

                return;

            }


            const finalTitle =
                customTitle.trim() ||
                "Monthly Bill Tracker";


            // =========================================
            // ASK ADDITIONAL NOTE
            // =========================================

            const additionalNote =
                prompt(

                    "Enter Additional Note (optional):",

                    ""

                );


            if (
                additionalNote === null
            ) {

                return;

            }


            // =========================================
            // OPEN PDF PREVIEW
            // =========================================

            openPdfPreview(

                billMonth,

                finalTitle,

                additionalNote.trim()

            );

        }
    );

}


// =====================================================
// BLOCK 12 — OPEN PDF PREVIEW
// =====================================================

async function openPdfPreview(

    billMonth,

    customTitle,

    additionalNote

) {

    const previewWindow =
        window.open(
            "",
            "_blank"
        );


    if (!previewWindow) {

        showMessage(
            "Please allow pop-ups for this page and try again."
        );

        return;

    }


    // =============================================
    // SHOW LOADING
    // =============================================

    previewWindow.document.open();

    previewWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Preparing PDF...
            </title>

            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    text-align:
                        center;

                    padding:
                        50px;

                }

            </style>

        </head>

        <body>

            <h2>
                Preparing PDF...
            </h2>

            <p>
                Please wait...
            </p>

        </body>

        </html>

    `);

    previewWindow.document.close();


    try {

        // =========================================
        // GET FRESH DATA
        // =========================================

        const url =
            API_URL +
            "?action=view&billMonth=" +
            encodeURIComponent(
                billMonth
            );


        const response =
            await fetch(url);


        const result =
            await response.json();


        if (!result.success) {

            previewWindow.close();

            showMessage(
                result.message ||
                "No bills found."
            );

            return;

        }


        // =========================================
        // CREATE PDF HTML
        // =========================================

        const pdfHtml =
            createPdfHtml(

                result,

                customTitle,

                additionalNote

            );


        // =========================================
        // WRITE PREVIEW
        // =========================================

        previewWindow.document.open();

        previewWindow.document.write(
            pdfHtml
        );

        previewWindow.document.close();


        previewWindow.focus();


    }

    catch (error) {

        console.error(error);

        previewWindow.close();

        showMessage(
            "PDF Preview could not be created."
        );

    }

}


// =====================================================
// BLOCK 13 — CREATE PDF HTML
// =====================================================

function createPdfHtml(

    result,

    customTitle,

    additionalNote

) {

    let rows = "";


    result.bills.forEach(
        function (bill) {

            rows += `

                <tr>

                    <td>
                        ${escapeHtml(
                            bill.referenceNumber
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            bill.billAmount
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            bill.status
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            bill.paymentDate
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            bill.notes
                        )}
                    </td>

                </tr>

            `;

        }
    );


    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>


<title>
    ${escapeHtml(customTitle)}
</title>


<style>

    @page {

        size: A4;

        margin: 15mm;

    }


    * {

        box-sizing:
            border-box;

    }


    body {

        font-family:
            Arial,
            Helvetica,
            sans-serif;

        margin:
            0;

        padding:
            20px;

        color:
            #111;

        background:
            #fff;

    }


    .toolbar {

        display:
            flex;

        gap:
            10px;

        justify-content:
            center;

        margin-bottom:
            25px;

        padding:
            12px;

        background:
            #f1f1f1;

        border-radius:
            8px;

    }


    .print-button {

        border:
            none;

        background:
            #24459c;

        color:
            white;

        padding:
            12px 24px;

        border-radius:
            7px;

        font-size:
            16px;

        font-weight:
            bold;

        cursor:
            pointer;

    }


    .close-button {

        border:
            1px solid #aaa;

        background:
            white;

        color:
            #222;

        padding:
            12px 24px;

        border-radius:
            7px;

        font-size:
            16px;

        cursor:
            pointer;

    }


    .header {

        text-align:
            center;

        margin-bottom:
            20px;

    }


    .header h1 {

        margin:
            0 0 10px 0;

        font-size:
            25px;

    }


    .header h2 {

        margin:
            0;

        font-size:
            18px;

    }


    .note {

        margin:
            15px 0;

        padding:
            12px;

        border:
            1px solid #ccc;

        border-radius:
            6px;

        font-size:
            13px;

        line-height:
            1.5;

    }


    table {

        width:
            100%;

        border-collapse:
            collapse;

        font-size:
            11px;

    }


    th,
    td {

        border:
            1px solid #ccc;

        padding:
            7px;

        text-align:
            left;

        vertical-align:
            top;

        word-break:
            break-word;

    }


    th {

        font-weight:
            bold;

        background:
            #f2f2f2;

    }


    .total {

        margin-top:
            15px;

        padding:
            12px;

        border:
            1px solid #ddd;

        background:
            #f5f5f5;

        border-radius:
            6px;

        font-weight:
            bold;

        line-height:
            1.8;

    }


    .footer {

        margin-top:
            25px;

        text-align:
            center;

        font-size:
            10px;

        color:
            #777;

    }


    @media print {

        body {

            padding:
                0;

        }


        .toolbar {

            display:
                none !important;

        }

    }


</style>

</head>


<body>


<div class="toolbar">

    <button
        class="print-button"
        onclick="window.print()"
    >
        Print / Save PDF
    </button>


    <button
        class="close-button"
        onclick="window.close()"
    >
        Close
    </button>

</div>


<div class="header">

    <h1>
        ${escapeHtml(customTitle)}
    </h1>


    <h2>

        Monthly Bill Report —
        ${escapeHtml(result.billMonth)}

    </h2>

</div>


${
    additionalNote
        ? `

            <div class="note">

                <strong>
                    Note:
                </strong>

                ${escapeHtml(
                    additionalNote
                )}

            </div>

          `
        : ""
}


<table>

    <thead>

        <tr>

            <th>
                Reference Number
            </th>

            <th>
                Bill Amount
            </th>

            <th>
                Status
            </th>

            <th>
                Payment Date
            </th>

            <th>
                Notes
            </th>

        </tr>

    </thead>


    <tbody>

        ${rows}

    </tbody>

</table>


<div class="total">

    Total Bills:
    ${escapeHtml(result.totalBills)}

    <br>

    Total Amount:
    ${escapeHtml(result.totalAmount)}

</div>


<div class="footer">

    Monthly Bill Tracker

</div>


</body>

</html>

    `;

}


// =====================================================
// END OF SCRIPT
// =====================================================