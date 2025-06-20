import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineIdentification
} from 'react-icons/hi';
import { createCustomerSchema, updateCustomerSchema } from './schema/cliente.schema';
import clienteApi from '../../api/clienteApi';

const ClienteForm = ({ cliente, onSuccess }) => {
  const isEditing = !!cliente;
  const schema = isEditing ? updateCustomerSchema : createCustomerSchema;
  const [error, setError] = useState('');

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
      address: ''
    }
  });

  // Cargar datos al editar
  useEffect(() => {
    if (cliente) {
      setValue('name', cliente.name || '');
      setValue('lastName', cliente.lastName || '');
      setValue('phone', cliente.phone || '');
      setValue('address', cliente.address || '');
    } else {
      reset();
    }
  }, [cliente, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      setError(''); // Limpiar errores previos

      if (isEditing) {
        await clienteApi.update(cliente.id, data);
      } else {
        console.log('Datos a enviar:', data);
        const response = await clienteApi.create(data);
        console.log('Respuesta del servidor:', response);
      }
      onSuccess();
      if (!isEditing) {
        reset(); // Solo resetear al crear
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} cliente: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="space-y-4">
        {/* Mostrar error general */}
        {error && (
          <div className="alert alert-error">
            <span className="text-sm">{error}</span>
          </div>
        )}

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

        {/* Botón submit */}
        <div className="w-full pt-2">
          <button
            type="submit"
            className={`btn btn-primary w-full ${isSubmitting ? 'loading btn-disabled' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Guardando...
              </>
            ) : isEditing ? (
              'Actualizar Cliente'
            ) : (
              'Crear Cliente'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClienteForm;
