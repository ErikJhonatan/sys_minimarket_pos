import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineIdentification
} from 'react-icons/hi';
import { createCustomerSchema, updateCustomerSchema } from './schema/cliente.schema';
import clienteApi from '../../api/clienteApi';

const ClienteForm = ({ cliente, onSuccess }) => {
  const isEditing = !!cliente;
  const schema = isEditing ? updateCustomerSchema : createCustomerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      lastName: '',
      phone: '',
      address: '',
      user: {
        email: '',
        role: 'customer'
      }
    }
  });

  // Cargar datos al editar
  useEffect(() => {
    if (cliente) {
      setValue('name', cliente.name || '');
      setValue('lastName', cliente.lastName || '');
      setValue('phone', cliente.phone || '');
      setValue('address', cliente.address || '');
      if (cliente.user) {
        setValue('user.email', cliente.user.email || '');
        setValue('user.role', 'customer');
      }
    } else {
      reset();
    }
  }, [cliente, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        // Para actualizar, solo enviamos los campos del cliente (sin user)
        const { user, ...customerData } = data;
        await clienteApi.update(cliente.id, customerData);
      } else {
        // Para crear, enviamos todos los datos incluyendo user
        await clienteApi.create(data);
      }
      onSuccess();
      reset();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="space-y-4">
        {/* Nombre */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Nombre</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Juan"
              className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
              {...register('name')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineUser size={18} />
            </span>
          </div>
          {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Apellido */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Apellido</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Pérez"
              className={`input input-bordered w-full pl-10 ${errors.lastName ? 'input-error' : ''}`}
              {...register('lastName')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineIdentification size={18} />
            </span>
          </div>
          {errors.lastName && <p className="text-error text-xs mt-1">{errors.lastName.message}</p>}
        </div>

        {/* Teléfono */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Teléfono</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              placeholder="+1234567890"
              className={`input input-bordered w-full pl-10 ${errors.phone ? 'input-error' : ''}`}
              {...register('phone')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlinePhone size={18} />
            </span>
          </div>
          {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {/* Dirección */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Dirección</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Calle 123, Ciudad"
              className={`input input-bordered w-full pl-10 ${errors.address ? 'input-error' : ''}`}
              {...register('address')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineLocationMarker size={18} />
            </span>
          </div>
          {errors.address && <p className="text-error text-xs mt-1">{errors.address.message}</p>}
        </div>

        {/* Campos de usuario (solo para crear) */}
        {!isEditing && (
          <>
            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Correo electrónico</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="juan@email.com"
                  className={`input input-bordered w-full pl-10 ${errors.user?.email ? 'input-error' : ''}`}
                  {...register('user.email')}
                />
                <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
                  <HiOutlineMail size={18} />
                </span>
              </div>
              {errors.user?.email && <p className="text-error text-xs mt-1">{errors.user.email.message}</p>}
            </div>
          </>
        )}

        {/* Botón submit */}
        <div className="w-full pt-2">
          <button
            type="submit"
            className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Guardando...'
              : isEditing
                ? 'Actualizar Cliente'
                : 'Crear Cliente'
            }
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClienteForm;
