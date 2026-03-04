import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";
import { ResumeState } from "./store";

const FONT = "Calibri";
const COLOR_TEXT = "111827";
const COLOR_MUTED = "4B5563";
const COLOR_ACCENT = "6D28D9";

function clean(value?: string) {
  return (value || "").trim();
}

function sectionTitle(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        color: "D1D5DB",
        space: 1,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        color: COLOR_ACCENT,
        font: FONT,
        size: 24,
      }),
    ],
  });
}

function bulletLine(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 22,
        color: COLOR_TEXT,
      }),
    ],
  });
}

export const generateDocx = async (data: ResumeState) => {
  const fullName = clean(data.personalInfo.fullName) || "CV Candidate";
  const email = clean(data.personalInfo.email);
  const phone = clean(data.personalInfo.phone);
  const linkedin = clean(data.personalInfo.linkedin);
  const portfolio = clean(data.personalInfo.portfolio);
  const summary = clean(data.summary);

  const contactLine = [email, phone, linkedin, portfolio].filter(Boolean).join("  |  ");

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: fullName.toUpperCase(),
          bold: true,
          size: 40,
          color: COLOR_TEXT,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: summary ? 80 : 240 },
      children: [
        new TextRun({
          text: contactLine || "",
          size: 21,
          color: COLOR_MUTED,
          font: FONT,
        }),
      ],
    }),
  ];

  if (summary) {
    children.push(sectionTitle("Professional Summary"));
    children.push(
      new Paragraph({
        spacing: { after: 220 },
        children: [new TextRun({ text: summary, size: 22, color: COLOR_TEXT, font: FONT })],
      })
    );
  }

  if (data.experience.length > 0) {
    children.push(sectionTitle("Experience"));

    data.experience.forEach((exp) => {
      const role = clean(exp.role);
      const company = clean(exp.company);
      const duration = [clean(exp.startDate), clean(exp.endDate)].filter(Boolean).join(" - ");
      const description = clean(exp.description);

      children.push(
        new Paragraph({
          spacing: { after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
          children: [
            new TextRun({ text: role || "Untitled Role", bold: true, size: 24, color: COLOR_TEXT, font: FONT }),
            new TextRun({ text: `\t${duration}`, italics: true, size: 21, color: COLOR_MUTED, font: FONT }),
          ],
        })
      );

      if (company) {
        children.push(
          new Paragraph({
            spacing: { after: 50 },
            children: [new TextRun({ text: company, bold: true, size: 22, color: COLOR_TEXT, font: FONT })],
          })
        );
      }

      if (description) {
        children.push(
          new Paragraph({
            spacing: { after: 170 },
            children: [new TextRun({ text: description, size: 22, color: COLOR_TEXT, font: FONT })],
          })
        );
      }
    });
  }

  if (data.education.length > 0) {
    children.push(sectionTitle("Education"));

    data.education.forEach((edu) => {
      const school = clean(edu.school);
      const degree = clean(edu.degree);
      const duration = [clean(edu.startDate), clean(edu.endDate)].filter(Boolean).join(" - ");

      children.push(
        new Paragraph({
          spacing: { after: 120 },
          tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
          children: [
            new TextRun({
              text: [school, degree].filter(Boolean).join(" - ") || "Education",
              bold: true,
              size: 22,
              color: COLOR_TEXT,
              font: FONT,
            }),
            new TextRun({ text: `\t${duration}`, italics: true, size: 21, color: COLOR_MUTED, font: FONT }),
          ],
        })
      );
    });
  }

  if (data.skills.length > 0) {
    children.push(sectionTitle("Skills"));
    children.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: data.skills.filter(Boolean).join(" • "),
            size: 22,
            color: COLOR_TEXT,
            font: FONT,
          }),
        ],
      })
    );
  }

  if (data.activities.length > 0) {
    children.push(sectionTitle("Activities"));
    data.activities.forEach((item) => {
      const title = [clean(item.role), clean(item.organization)].filter(Boolean).join(" - ");
      const duration = [clean(item.startDate), clean(item.endDate)].filter(Boolean).join(" - ");
      const description = clean(item.description);

      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: title || "Activity", bold: true, size: 22, color: COLOR_TEXT, font: FONT }),
            new TextRun({ text: duration ? ` (${duration})` : "", italics: true, size: 21, color: COLOR_MUTED, font: FONT }),
          ],
        })
      );

      if (description) children.push(bulletLine(description));
    });
  }

  if (data.certificates.length > 0) {
    children.push(sectionTitle("Certificates"));
    data.certificates.forEach((item) => {
      const line = [clean(item.name), clean(item.issuer), clean(item.date)].filter(Boolean).join(" • ");
      children.push(bulletLine(line || "Certificate"));
    });
  }

  if (data.awards.length > 0) {
    children.push(sectionTitle("Awards"));
    data.awards.forEach((item) => {
      const line = [clean(item.title), clean(item.issuer), clean(item.date)].filter(Boolean).join(" • ");
      children.push(bulletLine(line || "Award"));
      const desc = clean(item.description);
      if (desc) {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: desc, size: 21, color: COLOR_MUTED, font: FONT })],
          })
        );
      }
    });
  }

  if (data.references.length > 0) {
    children.push(sectionTitle("References"));
    data.references.forEach((item) => {
      const name = clean(item.name);
      const roleCompany = [clean(item.role), clean(item.company)].filter(Boolean).join(" - ");
      const contact = [clean(item.email), clean(item.phone)].filter(Boolean).join(" | ");

      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: name || "Reference", bold: true, size: 22, color: COLOR_TEXT, font: FONT })],
        })
      );
      if (roleCompany) children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: roleCompany, size: 21, color: COLOR_MUTED, font: FONT })] }));
      if (contact) children.push(new Paragraph({ spacing: { after: 110 }, children: [new TextRun({ text: contact, size: 21, color: COLOR_TEXT, font: FONT })] }));
    });
  }

  if (data.languages.length > 0) {
    children.push(sectionTitle("Languages"));
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({ text: data.languages.filter(Boolean).join(" • "), size: 22, color: COLOR_TEXT, font: FONT })],
      })
    );
  }

  if (data.interests.length > 0) {
    children.push(sectionTitle("Interests"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: data.interests.filter(Boolean).join(" • "), size: 22, color: COLOR_TEXT, font: FONT })],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${fullName.replace(/\s+/g, "_")}_CV.docx`;
  saveAs(blob, fileName);
};
