import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { MdEmail, MdLock } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await login(data);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setErrorMessage(result.error);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      setErrorMessage("Error inesperado. Intenta nuevamente.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-center h-screen overflow-hidden" data-theme="default">
      {errorMessage && (
        <div className="toast toast-end toast-end">
          <div className="alert alert-error">
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
      <div className="w-full p-8 m-auto bg-base-100 rounded-lg shadow-lg ring-2 ring-base-content/50 lg:max-w-lg">
        <h1 className="text-4xl font-bold text-center text-base-content">Sistema POS</h1>
        <p className="mt-2 text-sm text-center text-base-content">Accede a tu cuenta para continuar</p>
        <form className="space-y-6 mt-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label">
              <span className="text-base label-text">Email</span>
            </label>
            <div className="relative flex items-center">
              <MdEmail className="absolute left-3 text-base-content opacity-50 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Email Address"
                className={`w-full pl-10 input input-bordered focus:outline-none focus:ring-2 ${errors.email ? 'input-error' : 'focus:ring-primary'}`}
                {...register("email", { required: "El email es obligatorio", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } })}
              />
            </div>
            {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">
              <span className="text-base label-text">Password</span>
            </label>
            <div className="relative flex items-center">
              <MdLock className="absolute left-3 text-base-content opacity-50 pointer-events-none z-10" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                className={`w-full pl-10 input input-bordered focus:outline-none focus:ring-2 ${errors.password ? 'input-error' : 'focus:ring-primary'}`}
                {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 6, message: "Debe tener al menos 6 caracteres" } })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-base-content z-10"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}
          </div>
          <div className="flex justify-end text-sm">
            <a href="#" className="text-base-content hover:underline transition-colors">Olvidaste tu contraseña?</a>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Iniciando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
