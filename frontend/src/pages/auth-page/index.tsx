import { useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "common/auth";
import { useTranslation } from "common/i18n";
import type { TranslationKey } from "common/i18n";
import { inventoryApi } from "lib/api";

type AuthFormValues = {
  name: string;
  email: string;
  password: string;
};

export default function AuthPage() {
  const { user, authenticate } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const registration = location.pathname === "/register";
  const [serverError, setServerError] = useState<TranslationKey | null>(null);

  const schema = useMemo(
    () =>
      yup.object({
        name: registration
          ? yup.string().trim().min(2, t("nameRequired")).required(t("nameRequired"))
          : yup.string().defined(),
        email: yup.string().trim().email(t("emailRequired")).required(t("emailRequired")),
        password: yup.string().min(8, t("passwordRequired")).required(t("passwordRequired")),
      }),
    [registration, t],
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    reset,
  } = useForm<AuthFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    setServerError(null);
    clearErrors();
    reset({ name: "", email: "", password: "" });
  }, [clearErrors, registration, reset]);

  if (user) return <Navigate replace to="/orders" />;
  const destination = (location.state as { from?: string } | null)?.from ?? "/orders";

  const submit = async (values: AuthFormValues) => {
    setServerError(null);
    try {
      const session = registration
        ? await inventoryApi.register(values.name.trim(), values.email.trim(), values.password)
        : await inventoryApi.login(values.email.trim(), values.password);
      authenticate(session.user);
      navigate(destination, { replace: true });
    } catch (reason) {
      setServerError(toAuthenticationErrorKey(reason));
    }
  };

  const switchMode = () => {
    navigate(registration ? "/login" : "/register", { state: location.state });
  };

  return (
    <main className="auth-page">
      <form className="auth-card" noValidate onSubmit={handleSubmit(submit)}>
        <div className="auth-card__header">
          <img src="/inventory-logo.png" alt="Inventory" />
          <select
            className="auth-card__language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            aria-label={t("language")}
          >
            <option value="ru">Русский</option>
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="auth-card__intro">
          <h1>{registration ? t("createAccount") : t("welcomeBack")}</h1>
          <p>{registration ? t("register") : t("signIn")}</p>
        </div>
        {registration && (
          <label>
            {t("name")}
            <input
              className={errors.name ? "input--invalid" : undefined}
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && <small className="auth-card__field-error">{errors.name.message}</small>}
          </label>
        )}
        <label>
          {t("email")}
          <input
            type="email"
            autoComplete="email"
            className={errors.email ? "input--invalid" : undefined}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <small className="auth-card__field-error">{errors.email.message}</small>}
        </label>
        <label>
          {t("password")}
          <input
            type="password"
            autoComplete={registration ? "new-password" : "current-password"}
            className={errors.password ? "input--invalid" : undefined}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password && <small className="auth-card__field-error">{errors.password.message}</small>}
        </label>
        {serverError && <p className="auth-card__error" role="alert">{t(serverError)}</p>}
        <button className="button button--primary" disabled={isSubmitting}>
          {isSubmitting ? "…" : registration ? t("register") : t("signIn")}
        </button>
        <button type="button" className="auth-card__switch" onClick={switchMode}>
          {registration ? t("alreadyHaveAccount") : t("newHere")}
        </button>
      </form>
    </main>
  );
}

function toAuthenticationErrorKey(reason: unknown): TranslationKey {
  if (!(reason instanceof Error)) return "authenticationFailed";
  const message = reason.message.toLowerCase();
  if (message.includes("email is already registered"))
    return "emailAlreadyRegistered";
  if (message.includes("invalid email or password"))
    return "invalidCredentials";
  return "authenticationFailed";
}
