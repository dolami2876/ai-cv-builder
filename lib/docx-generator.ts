import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { ResumeState } from "@/lib/store";

export const generateDocx = async (resume: ResumeState) => {
    const { personalInfo, summary, experience, education, skills } = resume;

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Header
                    new Paragraph({
                        text: personalInfo.fullName.toUpperCase(),
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.linkedin}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                    }),

                    // Summary
                    new Paragraph({
                        text: "PROFESSIONAL SUMMARY",
                        heading: HeadingLevel.HEADING_2,
                        thematicBreak: true,
                        spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                        text: summary,
                    }),

                    // Experience
                    new Paragraph({
                        text: "WORK EXPERIENCE",
                        heading: HeadingLevel.HEADING_2,
                        thematicBreak: true,
                        spacing: { before: 200, after: 100 },
                    }),
                    ...experience.flatMap((exp) => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: exp.role, bold: true }),
                                new TextRun({ text: ` | ${exp.company}`, italics: true }),
                                new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}`, bold: true }),
                            ],
                            tabStops: [
                                { type: "right", position: 9000 } // Right align date
                            ]
                        }),
                        new Paragraph({
                            text: exp.description,
                            spacing: { after: 100 },
                        }),
                    ]),

                    // Education
                    new Paragraph({
                        text: "EDUCATION",
                        heading: HeadingLevel.HEADING_2,
                        thematicBreak: true,
                        spacing: { before: 200, after: 100 },
                    }),
                    ...education.map((edu) =>
                        new Paragraph({
                            children: [
                                new TextRun({ text: edu.school, bold: true }),
                                new TextRun({ text: ` | ${edu.degree}`, italics: true }),
                                new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}`, bold: true }),
                            ],
                            tabStops: [
                                { type: "right", position: 9000 }
                            ]
                        })
                    ),

                    // Skills
                    new Paragraph({
                        text: "SKILLS",
                        heading: HeadingLevel.HEADING_2,
                        thematicBreak: true,
                        spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                        text: skills.join(" • "),
                    }),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${personalInfo.fullName || "resume"}.docx`);
};
