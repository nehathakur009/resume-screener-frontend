export interface Role {
  title: string
  company: string
  start_date: string | null
  end_date: string | null
  description: string
  is_current?: boolean
}

export interface Education {
  degree: string
  institution: string
  start_date: string | null
  end_date: string | null
  field: string | null
}

export interface Flag {
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface CriterionScore {
  criterion: string
  weight: number
  score: number
  reason: string
  evidence?: {
    matched_skills?: string[]
    missing_skills?: string[]
    raw_text_references?: string[]
    matched_entity_ids?: string[]
    skill_source?: 'skills_section' | 'summary' | 'roles'
  }
}

export interface ParsedProfile {
  name: string | null
  email: string | null
  phone: string | null
  summary: string | null
  roles: Role[]
  education: Education[]
  skills: string[]
  certifications: string[]
  total_experience_years: number | null
}

export interface Resume {
  id: number
  candidate_id: number
  original_filename: string
  file_size: number
  created_at: string
  name: string
  candidate_email: string | null
  phone: string | null
  roles: Role[] | null
  education: Education[] | null
  skills: string[] | null
  certifications: string[] | null
  total_experience_years: number | null
  summary: string | null
  structural_flags: Flag[] | null
  parsed_at: string | null
}

export interface UploadResult {
  resume_id: number
  candidate_id: number
  duplicate: boolean
  profile: ParsedProfile
  structural_flags: Flag[]
  data: Resume
}

export interface ScoringResult {
  id: number
  resume_id: number
  jd_id: number
  jd_title: string
  total_score: number
  criterion_breakdown: CriterionScore[]
  flags: Flag[]
  overall_rationale: string
  rank: number
  scored_at: string
  original_filename: string
  name: string
  candidate_email: string | null
  phone: string | null
  skills: string[] | null
  total_experience_years: number | null
  roles: Role[] | null
  education: Education[] | null
}

export interface JobDescription {
  id: number
  title: string
  description: string
  created_at: string
}
