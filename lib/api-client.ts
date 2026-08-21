import { api } from "@/lib/api";
import type { ApiTheme } from "@/lib/theme";
import type {
  LoginResponse,
  Plan,
  PlanId,
  PlansCatalog,
  RegisterResponse,
  Subscription,
} from "@/lib/types/billing";
import type {
  AuthUser,
  MePayload,
  Profile,
  ProfileBlock,
  PublicPage,
  ServiceItem,
  TestimonialItem,
  UsernameCheck,
  BlockType,
  BlockContent,
} from "@/lib/types/profile";

export const authApi = {
  register(input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    plan: PlanId;
  }) {
    return api<RegisterResponse>("/auth/register", {
      method: "POST",
      body: input,
    });
  },
  login(input: { email: string; password: string }) {
    return api<LoginResponse>("/auth/login", {
      method: "POST",
      body: input,
    });
  },
  logout() {
    return api<{ ok?: boolean }>("/auth/logout", { method: "POST" });
  },
  me() {
    return api<MePayload>("/auth/me");
  },
  forgotPassword(email: string) {
    return api<{ message?: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },
  resetPassword(input: {
    token: string;
    password: string;
    confirmPassword: string;
  }) {
    return api<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: input,
    });
  },
  refresh() {
    return api<LoginResponse>("/auth/refresh", { method: "POST" });
  },
};

export const profileApi = {
  get() {
    return api<Profile>("/me/profile");
  },
  update(input: {
    username?: string;
    displayName?: string | null;
    headline?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    theme?: ApiTheme;
  }) {
    return api<Profile>("/me/profile", { method: "PUT", body: input });
  },
  publish() {
    return api<Profile>("/me/profile/publish", { method: "POST" });
  },
  unpublish() {
    return api<Profile>("/me/profile/unpublish", { method: "POST" });
  },
  preview() {
    return api<PublicPage>("/me/profile/preview");
  },
};

export const blocksApi = {
  list() {
    return api<ProfileBlock[]>("/me/profile/blocks");
  },
  create(input: {
    type: BlockType;
    title?: string | null;
    content?: BlockContent;
    sortOrder?: number;
    isVisible?: boolean;
  }) {
    return api<ProfileBlock>("/me/profile/blocks", {
      method: "POST",
      body: input,
    });
  },
  update(
    id: string,
    input: {
      title?: string | null;
      content?: BlockContent;
      sortOrder?: number;
      isVisible?: boolean;
    },
  ) {
    return api<ProfileBlock>(`/me/profile/blocks/${id}`, {
      method: "PATCH",
      body: input,
    });
  },
  remove(id: string) {
    return api<{ ok?: boolean }>(`/me/profile/blocks/${id}`, {
      method: "DELETE",
    });
  },
  reorder(items: { id: string; sortOrder: number }[]) {
    return api<ProfileBlock[]>("/me/profile/blocks/reorder", {
      method: "PUT",
      body: items,
    });
  },
};

export const servicesApi = {
  list() {
    return api<ServiceItem[]>("/me/profile/services");
  },
  create(input: {
    name: string;
    description?: string | null;
    priceCents: number;
    sortOrder?: number;
    isVisible?: boolean;
  }) {
    return api<ServiceItem>("/me/profile/services", {
      method: "POST",
      body: input,
    });
  },
  update(
    id: string,
    input: Partial<{
      name: string;
      description: string | null;
      priceCents: number;
      sortOrder: number;
      isVisible: boolean;
    }>,
  ) {
    return api<ServiceItem>(`/me/profile/services/${id}`, {
      method: "PATCH",
      body: input,
    });
  },
  remove(id: string) {
    return api<{ ok?: boolean }>(`/me/profile/services/${id}`, {
      method: "DELETE",
    });
  },
};

export const testimonialsApi = {
  list() {
    return api<TestimonialItem[]>("/me/profile/testimonials");
  },
  create(input: {
    authorName: string;
    text: string;
    rating?: number;
    sortOrder?: number;
    isVisible?: boolean;
  }) {
    return api<TestimonialItem>("/me/profile/testimonials", {
      method: "POST",
      body: input,
    });
  },
  update(
    id: string,
    input: Partial<{
      authorName: string;
      text: string;
      rating: number;
      sortOrder: number;
      isVisible: boolean;
    }>,
  ) {
    return api<TestimonialItem>(`/me/profile/testimonials/${id}`, {
      method: "PATCH",
      body: input,
    });
  },
  remove(id: string) {
    return api<{ ok?: boolean }>(`/me/profile/testimonials/${id}`, {
      method: "DELETE",
    });
  },
};

export const publicApi = {
  getPage(username: string) {
    return api<PublicPage>(`/p/${encodeURIComponent(username)}`, {
      credentials: "omit",
      next: { revalidate: 60 },
    });
  },
  checkUsername(username: string) {
    return api<UsernameCheck>(
      `/usernames/check?username=${encodeURIComponent(username)}`,
    );
  },
};

export const billingApi = {
  plans() {
    return api<PlansCatalog>("/billing/plans", {
      credentials: "omit",
      next: { revalidate: 3600 },
    });
  },
  checkout(input: { email: string; password: string; plan: PlanId }) {
    return api<{ checkoutUrl: string | null }>("/billing/checkout", {
      method: "POST",
      body: input,
    });
  },
  confirmSession(sessionId: string) {
    return api<{ subscription?: Subscription }>("/billing/confirm-session", {
      method: "POST",
      body: { sessionId },
    });
  },
  subscription() {
    return api<{ plans: Plan[]; subscription: Subscription }>(
      "/billing/subscription",
    );
  },
  changePlan(plan: PlanId) {
    return api<unknown>("/billing/change-plan", {
      method: "POST",
      body: { plan },
    });
  },
  cancel() {
    return api<unknown>("/billing/cancel", { method: "POST" });
  },
  resume() {
    return api<unknown>("/billing/resume", { method: "POST" });
  },
  portal() {
    return api<{ portalUrl: string }>("/billing/portal", { method: "POST" });
  },
};

export type { AuthUser, Profile, PublicPage };
