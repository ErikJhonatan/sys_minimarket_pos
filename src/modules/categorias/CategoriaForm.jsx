import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiOutlineTag, HiOutlinePhotograph } from 'react-icons/hi';
import { createCategorySchema, updateCategorySchema } from './schema/categoria.schema';
import categoriaApi from '../../api/categoriaApi';

const CategoriaForm = ({ categoria, onSuccess }) => {
  const isEditing = !!categoria;
  const schema = isEditing ? updateCategorySchema : createCategorySchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      image: ''
    }
  });

  const watchedImage = watch('image');

  // Cargar datos al editar
  useEffect(() => {
    if (categoria) {
      setValue('name', categoria.name);
      setValue('image', categoria.image);
    } else {
      reset();
    }
  }, [categoria, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await categoriaApi.update(categoria.id, data);

      } else {
        await categoriaApi.create(data);
      }
      onSuccess();
      reset();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="space-y-4">
        {/* Vista previa de imagen */}
        {watchedImage && (
          <div className="flex justify-center">
            <div className="avatar">
              <div className="w-20 h-20 rounded-lg border border-base-300">
                <img
                  src={watchedImage}
                  alt="Vista previa"
                  className="object-cover w-full h-full rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Campo Nombre */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Nombre de la categoría</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: Bebidas, Lácteos, Snacks..."
              className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
              {...register('name')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineTag size={18} />
            </span>
          </div>
          {errors.name ? (
            <p className="text-error text-xs mt-1">{errors.name.message}</p>
          ) : (
            <p className="text-base-content/60 text-xs mt-1">Entre 3 y 15 caracteres</p>
          )}
        </div>

        {/* Campo Imagen */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">URL de la imagen</span>
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              className={`input input-bordered w-full pl-10 ${errors.image ? 'input-error' : ''}`}
              {...register('image')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlinePhotograph size={18} />
            </span>
          </div>
          {errors.image ? (
            <p className="text-error text-xs mt-1">{errors.image.message}</p>
          ) : (
            <p className="text-base-content/60 text-xs mt-1">URL válida para la imagen</p>
          )}
        </div>

        {/* Botón de submit */}
        <div className="w-full pt-2">
          <button
            type="submit"
            className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Guardando...'
              : isEditing
                ? 'Actualizar'
                : 'Crear Categoría'
            }
          </button>
        </div>
      </div>
    </form>
  );
};

export default CategoriaForm;
