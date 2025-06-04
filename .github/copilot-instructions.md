# ✨ Copilot Instructions

## 🎯 Propósito del proyecto

Este proyecto es una aplicación frontend desarrollada en **React** usando **Tailwind CSS** y **DaisyUI**. El objetivo es construir una interfaz moderna, visualmente agradable y consistente para un sistema POS con módulos como login, productos, ventas, clientes, reportes, etc.

---

## 🎨 Reglas de diseño UI

1. **Todos los componentes visuales deben usar clases de `daisyUI`** para mantener coherencia con el tema actual.
2. **No usar colores hardcodeados.** Usa `btn-primary`, `bg-base-200`, `text-base-content`, etc. Nunca `bg-[#ff0000]` o `text-red-500` directamente.
3. **Utiliza íconos (`react-icons`) apropiados en los campos de formulario** como `email`, `password`, `search`, etc.
4. **Entradas (`input`, `select`, etc.) deben estar dentro de componentes `form-control` y usar estilos DaisyUI como `input input-bordered`.**
5. **Los botones deben ser componentes `btn` de DaisyUI.** Usa variantes como `btn-primary`, `btn-accent`, `btn-outline`, etc.
6. **Layout:** Preferir `flex`, `grid`, `card`, `modal`, `navbar`, `drawer`, `tabs`, `steps`, `table`, etc. de DaisyUI.
7. La UI debe ser **limpia, accesible y moderna**.

---

## 🧩 Componentes esperados

- Formularios usando `react-hook-form`
- Iconos contextuales con `react-icons`
- Validaciones visibles pero sin saturar al usuario
- Cards, modals y tablas para mostrar datos (ej. productos, ventas)
- Rutas protegidas y login bonito
- Transiciones suaves (usa clases como `transition`, `duration-300`)

---

## 🧪 Buenas prácticas

- No repetir clases, usa componentes reutilizables.
- No usar código inline (`style={{ color: 'red' }}`), usar utilidades de Tailwind o clases DaisyUI.
- Formularios deben mostrar errores con `text-error` debajo del input.
- Prefiere diseño móvil primero (`sm:`, `md:`, etc. cuando sea necesario).
- Los elementos deben tener espacio y no estar apretados (`gap-4`, `p-4`, `rounded-box`).

---

## 🛠 Ejemplo de input correcto

```jsx
<div className="form-control w-full">
  <label className="label">
    <span className="label-text">Correo electrónico</span>
  </label>
  <div className="relative">
    <input
      type="email"
      placeholder="ejemplo@correo.com"
      className="input input-bordered w-full pl-10"
      {...register("email", { required: "Email requerido" })}
    />
    <span className="absolute top-3 left-3 text-gray-500">
      <HiOutlineMail />
    </span>
  </div>
  {errors.email && <p className="text-error mt-1">{errors.email.message}</p>}
</div>
