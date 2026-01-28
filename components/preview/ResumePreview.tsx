"use client";

import { useResumeStore } from "@/lib/store";
import { Mail, Phone, Linkedin, Globe } from "lucide-react";
import { useRef, useState } from "react";

export default function ResumePreview() {
  const store = useResumeStore();
  const {
    personalInfo,
    experience,
    education,
    skills,
    summary,
    style,
    setPersonalInfo,
    setSummary,
    updateExperience,
    updateEducation,
  } = store;

  const hexColor = style?.hexColor || "#000000";
  const layout = style?.layout || "modern";
  const font = style?.font || "inter";

  const containerStyle = {
    fontFamily:
      font === "serif"
        ? "Times New Roman, serif"
        : font === "mono"
        ? "Courier New, monospace"
        : "Arial, sans-serif",
  };

  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setPersonalInfo({ avatarUrl: data.url });
    } catch (error) {
      console.error(error);
      alert("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const summaryPlaceholder =
    "A professional summary of your background and goals...";

  const handleInlineSummaryBlur = (
    e: React.FocusEvent<HTMLParagraphElement>
  ) => {
    const text = e.currentTarget.innerText.trim();
    if (!text || text === summaryPlaceholder) {
      setSummary("");
    } else {
      setSummary(text);
    }
  };

  const renderSharedSections = () => (
    <>
      <section className="mb-6">
        <h3
          className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1"
          style={{ color: hexColor, borderColor: "#e5e7eb" }}
        >
          Profile
        </h3>
        <p
          className="text-gray-700 leading-relaxed outline-none cursor-text"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleInlineSummaryBlur}
        >
          {summary || summaryPlaceholder}
        </p>
      </section>

      <section className="mb-6">
        <h3
          className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1"
          style={{ color: hexColor, borderColor: "#e5e7eb" }}
        >
          Experience
        </h3>
        <div className="space-y-5">
          {experience.length === 0 && (
            <p className="text-gray-400 italic">No experience added.</p>
          )}
          {experience.map((exp, index) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h4
                  className="font-bold text-gray-900 outline-none cursor-text"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateExperience(
                      index,
                      "role",
                      e.currentTarget.innerText.trim()
                    )
                  }
                >
                  {exp.role}
                </h4>
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-wide mb-2 outline-none cursor-text"
                style={{ color: hexColor }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  updateExperience(
                    index,
                    "company",
                    e.currentTarget.innerText.trim()
                  )
                }
              >
                {exp.company}
              </div>
              <div className="pl-1 border-l-2 border-gray-100">
                {exp.description
                  ?.split("•")
                  .map((item) => item.trim())
                  .filter((item) => item.length > 0).length ? (
                  <ul className="space-y-1 list-disc ml-4 text-gray-700">
                    {exp.description
                      ?.split("•")
                      .map((item) => item.trim())
                      .filter((item) => item.length > 0)
                      .map((item, i) => (
                        <li
                          key={i}
                          className="outline-none cursor-text"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            updateExperience(
                              index,
                              "description",
                              e.currentTarget.innerText.trim()
                            )
                          }
                        >
                          {item}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p
                    className="text-gray-700 whitespace-pre-line pl-1 border-l-2 border-gray-100 outline-none cursor-text"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      updateExperience(
                        index,
                        "description",
                        e.currentTarget.innerText.trim()
                      )
                    }
                  >
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3
          className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1"
          style={{ color: hexColor, borderColor: "#e5e7eb" }}
        >
          Education
        </h3>
        <div className="space-y-3">
          {education.length === 0 && (
            <p className="text-gray-400 italic">No education added.</p>
          )}
          {education.map((edu, index) => (
            <div key={edu.id} className="flex justify-between">
              <div>
                <h4
                  className="font-bold text-gray-900 outline-none cursor-text"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateEducation(
                      index,
                      "school",
                      e.currentTarget.innerText.trim()
                    )
                  }
                >
                  {edu.school}
                </h4>
                <div
                  className="outline-none cursor-text"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateEducation(
                      index,
                      "degree",
                      e.currentTarget.innerText.trim()
                    )
                  }
                >
                  {edu.degree}
                </div>
              </div>
              <div className="text-xs font-medium text-gray-500 text-right">
                <span
                  className="outline-none cursor-text"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateEducation(
                      index,
                      "startDate",
                      e.currentTarget.innerText.trim()
                    )
                  }
                >
                  {edu.startDate}
                </span>
                {" – "}
                <span
                  className="outline-none cursor-text"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateEducation(
                      index,
                      "endDate",
                      e.currentTarget.innerText.trim()
                    )
                  }
                >
                  {edu.endDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {store.activities && store.activities.length > 0 && (
        <section className="mb-6">
          <h3
            className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1"
            style={{ color: hexColor, borderColor: "#e5e7eb" }}
          >
            Activities
          </h3>
          <div className="space-y-4">
            {store.activities.map((act) => (
              <div key={act.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-gray-900">{act.role}</h4>
                  <span className="text-xs font-medium text-gray-500">
                    {act.startDate} – {act.endDate}
                  </span>
                </div>
                <div
                  className="text-xs font-semibold uppercase tracking-wide mb-1"
                  style={{ color: hexColor }}
                >
                  {act.organization}
                </div>
                <p className="text-gray-700">{act.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {store.certificates && store.certificates.length > 0 && (
        <section className="mb-6">
          <h3
            className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1"
            style={{ color: hexColor, borderColor: "#e5e7eb" }}
          >
            Certificates
          </h3>
          <div className="grid gap-2">
            {store.certificates.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <div>
                  <span className="font-semibold text-gray-900">{cert.name}</span>
                  <span className="text-gray-600"> - {cert.issuer}</span>
                </div>
                <span className="text-xs text-gray-500">{cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {store.awards && store.awards.length > 0 && (
        <section className="mb-6">
          <h3
            className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1"
            style={{ color: hexColor, borderColor: "#e5e7eb" }}
          >
            Honors & Awards
          </h3>
          <div className="space-y-3">
            {store.awards.map((award) => (
              <div key={award.id}>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">{award.title}</span>
                  <span className="text-xs text-gray-500">{award.date}</span>
                </div>
                <div className="text-xs text-gray-600 mb-1">{award.issuer}</div>
                {award.description && (
                  <p className="text-sm text-gray-700">{award.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {store.interests && store.interests.length > 0 && (
        <section className="mb-6">
          <h3
            className="mb-3 text-xs font-bold uppercase tracking-wider border-b pb-1"
            style={{ color: hexColor, borderColor: "#e5e7eb" }}
          >
            Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {store.interests.map((interest, i) => (
              <span key={i} className="text-gray-700">
                {interest}
                {i < store.interests.length - 1 ? " • " : ""}
              </span>
            ))}
          </div>
        </section>
      )}

      {store.references && store.references.length > 0 && (
        <section className="mb-6">
          <h3
            className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1"
            style={{ color: hexColor, borderColor: "#e5e7eb" }}
          >
            References
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {store.references.map((ref) => (
              <div key={ref.id} className="text-sm">
                <div className="font-bold text-gray-900">{ref.name}</div>
                <div className="text-gray-700">
                  {ref.role} - {ref.company}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>{ref.phone}</div>
                  <div>{ref.email}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3
          className="mb-3 text-xs font-bold uppercase tracking-wider border-b pb-1"
          style={{ color: hexColor, borderColor: "#e5e7eb" }}
        >
          Skills
        </h3>
        <div className="flex flex-wrap gap-x-2 gap-y-2">
          {skills.length === 0 && (
            <p className="text-gray-400 italic">No skills added.</p>
          )}
          {skills.map((skill, i) => (
            <span
              key={i}
              className="text-gray-800 font-medium bg-gray-50 px-2 py-0.5 rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <div
      id="resume-preview-container"
      className="mx-auto w-[210mm] min-h-[297mm] bg-white p-[20mm] shadow-2xl overflow-hidden text-sm leading-relaxed text-gray-800 transition-colors"
      style={containerStyle}
    >
      {/* Sidebar layout */}
      {layout === "sidebar" && (
        <div className="flex h-full">
          {/* Sidebar left */}
          <aside className="w-[35%] bg-slate-900 text-white p-6 flex flex-col gap-8">
            <div className="text-center">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="relative mx-auto mb-4 h-24 w-24 rounded-full overflow-hidden border-2 border-slate-700 flex items-center justify-center bg-slate-700 text-xs text-slate-200 group"
              >
                {personalInfo.avatarUrl ? (
                  <img
                    src={personalInfo.avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>Ảnh</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white transition">
                  {avatarUploading ? "Đang tải..." : "Tải ảnh lên"}
                </div>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <h1
                className="text-lg font-extrabold tracking-wide outline-none cursor-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setPersonalInfo({
                    fullName: e.currentTarget.innerText.trim(),
                  })
                }
              >
                {personalInfo.fullName || "Your Name"}
              </h1>
              <p
                className="mt-1 text-xs uppercase tracking-widest text-slate-300 outline-none cursor-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setPersonalInfo({
                    portfolio: e.currentTarget.innerText.trim(),
                  })
                }
              >
                {personalInfo.portfolio || "POSITION / HEADLINE"}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                Contact
              </h3>
              <div className="space-y-1 text-xs text-slate-100">
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-3 w-3" />
                    <span className="truncate">{personalInfo.linkedin}</span>
                  </div>
                )}
                {personalInfo.portfolio && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <span className="truncate">{personalInfo.portfolio}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1">
                {skills.length === 0 && (
                  <span className="text-[11px] text-slate-400 italic">No skills yet</span>
                )}
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {(store.languages?.length || store.interests?.length) && (
              <div className="space-y-4 mt-auto">
                {store.languages?.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                      Languages
                    </h3>
                    <div className="space-y-1 text-xs text-slate-100">
                      {store.languages.map((lang, i) => (
                        <div key={i}>{lang}</div>
                      ))}
                    </div>
                  </div>
                )}
                {store.interests?.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                      Interests
                    </h3>
                    <div className="space-y-1 text-xs text-slate-100">
                      {store.interests.map((it, i) => (
                        <div key={i}>{it}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Right content */}
          <main className="w-[65%] bg-white p-8 space-y-6">{renderSharedSections()}</main>
        </div>
      )}

      {/* Modern / Classic share the same body, just different header */}
      {layout !== "sidebar" && (
        <>
          {layout === "modern" && (
            <header className="mb-6 border-b-2 pb-6" style={{ borderColor: hexColor }}>
              <h1
                className="mb-2 text-4xl font-extrabold uppercase tracking-tight text-gray-900 outline-none cursor-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setPersonalInfo({
                    fullName: e.currentTarget.innerText.trim(),
                  })
                }
              >
                {personalInfo.fullName || "Your Name"}
              </h1>
              <p
                className="text-lg font-medium tracking-wide mb-4 outline-none cursor-text"
                style={{ color: hexColor }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setPersonalInfo({
                    portfolio: e.currentTarget.innerText.trim(),
                  })
                }
              >
                {personalInfo.portfolio || "Professional Title"}
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
              </div>
            </header>
          )}

          {layout === "classic" && (
            <header className="mb-8 text-center">
              <h1
                className="mb-2 text-3xl font-serif font-bold text-gray-900 outline-none cursor-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setPersonalInfo({
                    fullName: e.currentTarget.innerText.trim(),
                  })
                }
              >
                {personalInfo.fullName || "Your Name"}
              </h1>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600 mb-4">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
              </div>
              <div
                className="h-0.5 w-16 bg-gray-800 mx-auto"
                style={{ backgroundColor: hexColor }}
              ></div>
            </header>
          )}

          {renderSharedSections()}
        </>
      )}
    </div>
  );
}
