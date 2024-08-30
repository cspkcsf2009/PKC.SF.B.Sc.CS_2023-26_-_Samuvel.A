import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, TextRun, WidthType, PageSize } from 'docx';

// Function to create a table with data and headers
const createTable = (data, header) => {
    return new Table({
        rows: [
            // Header Row
            new TableRow({
                children: header.map(text => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text, bold: true, size: 30 })], // Increased font size for header
                        alignment: 'center',
                    })],
                    shading: { fill: 'CCCCCC' }, // Light gray background for header
                    border: {
                        top: { style: 'single', size: 4, space: 0 }, // Border styles for header cells
                        bottom: { style: 'single', size: 4, space: 0 },
                        left: { style: 'single', size: 4, space: 0 },
                        right: { style: 'single', size: 4, space: 0 },
                    },
                })),
                tableHeader: true,
            }),
            // Data Rows
            ...data.map(row => {
                const isAbsent = row[2] === 'Absent'; // Check if the status is 'Absent'

                return new TableRow({
                    children: row.map(cell => new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: cell, size: 28 })], // Increased font size for cells
                            alignment: 'center',
                        })],
                        shading: { fill: isAbsent ? 'FFCCCC' : 'FFFFFF' }, // Light red background for absent rows
                        border: {
                            top: { style: 'single', size: 1, space: 0 }, // Border styles for data cells
                            bottom: { style: 'single', size: 1, space: 0 },
                            left: { style: 'single', size: 1, space: 0 },
                            right: { style: 'single', size: 1, space: 0 },
                        },
                    })),
                });
            }),
        ],
        width: {
            size: 100, // Table width in percentage
            type: WidthType.PERCENTAGE,
        },
    });
};

// Function to generate the .docx file
export const generateDocx = async (allStudents, selectedClass, selectedSubject, date, counts) => {
    const docSections = [];

    // Extract counts with default values to avoid destructuring errors
    const { presentCount = 0, absentCount = 0 } = counts || {};

    // Create header paragraphs with date, class, subject, and counts
    const header = [
        `Class: ${selectedClass}`,
        `Title: ${selectedSubject}`,
        `Date: ${date}`,
        `Present Count: ${presentCount}   Absent Count: ${absentCount}`,
    ];

    // Add the main title for the document
    docSections.push(new Paragraph({
        heading: HeadingLevel.HEADING_1, // Set the heading level for the title
        alignment: 'center', // Center align the title
        children: [new TextRun({
            text: 'Attendance Report',
            bold: true, // Make the title bold
            size: 48, // Title font size
        })],
    }));

    // Add header information paragraphs
    docSections.push(...header.map(text => new Paragraph({
        children: [new TextRun({ text, size: 28 })], // Increased font size for header information
        alignment: 'center', // Center align header information
        spacing: { after: 200 }, // Add space after each header
    })));

    // Sort all students by rollNo
    const sortedStudents = allStudents.sort((a, b) => a.rollNo - b.rollNo);

    // Prepare data rows for the table
    const newRows = sortedStudents.map(student => [
        student.rollNo.toString(), // Roll number
        student.name, // Name
        student.attendanceStatus, // Status
    ]);

    // Add the table to the document sections
    docSections.push(createTable(newRows, ['Roll No.', 'Name', 'Status']));

    // Create the document with sections and page properties
    const doc = new Document({
        sections: [
            {
                children: docSections,
                properties: {
                    page: {
                        size: PageSize.A4, // Set page size to A4
                        margins: {
                            top: 567,   // 1 cm margin at the top
                            right: 567, // 1 cm margin on the right
                            bottom: 567, // 1 cm margin at the bottom
                            left: 567,  // 1 cm margin on the left
                        },
                    },
                },
            },
        ],
    });

    try {
        // Convert the document to a Blob and return it
        const blob = await Packer.toBlob(doc);
        return blob;
    } catch (error) {
        // Log and throw an error if document generation fails
        console.error('Error generating .docx file:', error);
        throw new Error('An error occurred while generating the document. Please try again.');
    }
};