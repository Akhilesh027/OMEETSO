export function hasApplicationResume(profile: any): boolean {
  const url = typeof profile?.resumeUrl === "string" ? profile.resumeUrl.trim() : "";
  if (/^https?:\/\//i.test(url) || /^data:application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,\S+$/i.test(url)) return true;
  const education = !!profile?.education?.trim() || profile?.educations?.some((item: any) => item?.qualification?.trim());
  const skills = profile?.skills?.some((item: any) => typeof item === "string" && item.trim()) || profile?.skillsList?.some((item: any) => item?.name?.trim());
  return !!(education && skills && (profile?.summary?.trim() || profile?.title?.trim()));
}
