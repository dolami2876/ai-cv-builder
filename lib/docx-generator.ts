import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType } from "docx";
import { saveAs } from "file-saver";
import { ResumeState } from "./store"; // Adjust import path if needed

export const generateDocx = async (data: ResumeState) => {
    const doc = new Document({
        sections: [
            {
                properties: {
                    type: SectionType.CONTINUOUS,
                },
                children: [
                    // Header
                    new Paragraph({
                        text: data.personalInfo.fullName.toUpperCase(),
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: `${data.personalInfo.email} | ${data.personalInfo.phone}`, size: 22 }),
                            new TextRun({ text: data.personalInfo.linkedin ? ` | ${data.personalInfo.linkedin}` : "", size: 22 }),
                            new TextRun({
                                text: "\n" + (data.summary || ""),
                                italics: true,
                                size: 24,
                                break: 1,
                            }),
                        ],
                        spacing: { after: 300 },
                    }),

                    // Experience
                    new Paragraph({
                        text: "EXPERIENCE",
                        heading: HeadingLevel.HEADING_2,
                        border: { bottom: { style: "single", space: 1, color: "000000" } },
                        spacing: { before: 200, after: 100 },
                    }),
                    ...data.experience.flatMap((exp) => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: exp.role, bold: true, size: 24 }),
                                new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, size: 22 }), // Simplified tab
                            ],
                            tabStops: [{ type: "right", position: 9000 }], // Right align date
                        }),
                        new Paragraph({
                            text: exp.company,
                            alignment: AlignmentType.LEFT,
                            spacing: { after: 50 },
                        }),
                        new Paragraph({
                            text: exp.description,
                            spacing: { after: 200 },
                        })
                    ]),

                    // Education
                    new Paragraph({
                        text: "EDUCATION",
                        heading: HeadingLevel.HEADING_2,
                        border: { bottom: { style: "single", space: 1, color: "000000" } },
                        spacing: { before: 200, after: 100 },
                    }),
                    ...data.education.map((edu) =>
                        new Paragraph({
                            children: [
                                new TextRun({ text: edu.school, bold: true, size: 24 }),
                                new TextRun({ text: ` - ${edu.degree}`, size: 24 }),
                                new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}`, size: 22 }),
                            ],
                            tabStops: [{ type: "right", position: 9000 }],
                        })
                    ),

                    // Skills
                    new Paragraph({
                        text: "SKILLS",
                        heading: HeadingLevel.HEADING_2,
                        border: { bottom: { style: "single", space: 1, color: "000000" } },
                        spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                        text: data.skills.join(", "),
                        spacing: { after: 200 },
                    }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${data.personalInfo.fullName.replace(/\s+/g, "_")}_CV.docx`);
};
