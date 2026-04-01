// ========== Django REST API Types ==========

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: Profile;
}
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_coach: boolean;
}

export interface Profile {
  id: number;
  user: User;
  photo: string | null;
  bio: string;
  box: string;
  box_name: string;
  username:string;
  first_name: string;
  last_name: string;
  genre: string;
  weight: number | null;
  height: number | null;
  view_weight: boolean;
  view_height: boolean;
  view_box: boolean;
  view_category: boolean;
  view_personal_record: boolean;
  gender: string;
  date_of_birth: string | null;
  category: string;
  is_coach: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface PostImage {
  id: number;
  post_image: string;
}

export interface PostVideo {
  id: number;
  post_video: string;
}

export interface Comment {
  id: number;
  author_username: User;
  comments: string;
  created_at: string;
}



export interface Post {
  id: number;
  author: User;
  author_profile?: Profile;
  text: string;
  created_at: string;
  images: PostImage[];
  videos: PostVideo[];
  like: number[];
  likes_count: number;
  comments: Comment[];
  comments_count: number;
  is_liked: boolean;
  is_owner: boolean;
}


export interface Box {
  id: number;
  box_name: string;
}

export type TeamForm = {
  name: string;
  description: string;
  box: number | "";
  category: string;
};
export interface StoryImage {
  id: number;
  story_image: string;
}

export interface StoryVideo {
  id: number;
  story_video: string;
}

export interface Story {
  id: number;
  user: User;
  images: StoryImage[];
  videos: StoryVideo[];
  created_at: string;
  is_viewed: boolean;
}

export interface Movement {
  id: number;
  name: string;
}

export interface Wod {
  id: number;
  title: string;
  description_wod: string;
  coach_user: User;
  date: string;
  pinned: boolean;
  like: number[];
  likes_count: number;
  is_liked: boolean;
}

export interface Event {
  id: number;
  name: string;
  date_initial: string;
  location: string;
  description: string;
  image: string | null;
  created_by: User;
  participants: number;
  is_participating: boolean;
}
type ProfilePersonalRecordPayload = {
  moviment: number
  personal_record: string
  date: string
}
export interface ProfilePersonalRecord {
  id: number;
  moviment: number;
  name_moviment: string;
  personal_record: string;
  date: string;
}

export interface Movement {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  creator: number;
  name: string;
  description: string;
  box: Box;
  category: string;
  members: User[];
}

export interface TimeAchievement {
  id: number;
  team: number;
  title: string;
  description: string;
  date: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// API paginated response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ========== Django REST API Types ==========

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Profile {
  id: number;
  user: User;
  photo: string | null;
  bio: string;
  box: string;
  weight: number | null;
  height: number | null;
  view_weight: boolean;
  view_height: boolean;
  gender: string;
  date_of_birth: string | null;
  category: string;
  is_coach: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface PostImage {
  id: number;
  post_image: string;
}

export interface PostVideo {
  id: number;
  post_video: string;
}

export interface Comment {
  id: number;
  author: User;
  text: string;
  created_at: string;
}

export interface Post {
  id: number;
  author: User;
  author_profile?: Profile;
  text: string;
  created_at: string;
  images: PostImage[];
  videos: PostVideo[];
  like: number[];
  likes_count: number;
  comments: Comment[];
  comments_count: number;
  is_liked: boolean;
  is_owner: boolean;
}

export interface StoryImage {
  id: number;
  story_image: string;
}

export interface StoryVideo {
  id: number;
  story_video: string;
}

export interface Story {
  id: number;
  user: User;
  user_profile?: Profile;
  images: StoryImage[];
  videos: StoryVideo[];
  created_at: string;
  is_viewed: boolean;
}

export interface MovementType {
  id: number;
  name: string;
}

export interface Movement {
  id: number;
  name: string;
  description?: string;
  type: MovementType;
}

export interface WodMovement {
  id: number;
  wod: number;
  movement: Movement;
  reps?: number;
  weight?: number;
  distance?: number;
  calories?: number;
  order: number;
  notes?: string;
}

export interface Wod {
  id: number;
  title: string;
  description_wod: string;
  type: 'FOR_TIME' | 'AMRAP' | 'EMOM';
  coach: User;
  coach_profile?: Profile;
  date: string;
  pinned: boolean;
  like: number[];
  likes_count: number;
  is_liked: boolean;
  movements?: WodMovement[];
  time_cap?: number;
  rounds?: number;
}

export interface ForTimeResult {
  id: number;
  wod_result: number;
  time_seconds: number;
}

export interface AmrapResult {
  id: number;
  wod_result: number;
  rounds: number;
  reps: number;
}

export interface EmomResult {
  id: number;
  wod_result: number;
  rounds_completed: number;
  failed_minute?: number;
}

export interface WodResult {
  id: number;
  user: User;
  wod: number;
  completed: boolean;
  date: string;
  notes?: string;
  for_time?: ForTimeResult;
  amrap?: AmrapResult;
  emom?: EmomResult;
}

export interface LeaderboardEntry {
  position: number;
  username: string;
  completed: boolean;
  date: string;
  time?: number;
  time_formatted?: string;
  rounds?: number;
  reps?: number;
  result_formatted?: string;
  rounds_completed?: number;
  failed_minute?: number;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  description: string;
  image: string | null;
  created_by: User;
  participants_count: number;
  is_participating: boolean;
}

export interface ProfilePersonalRecord {
  id: number;
  athlete: User;
  moviment: string;
  personal_record: string;
  date: string;
}

export interface Team {
  id: number;
  creator: User;
  name: string;
  description: string;
  box: string;
  category: string;
  members: User[];
}

export interface TimeAchievement {
  id: number;
  team: number;
  title: string;
  description: string;
  date: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// API paginated response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
