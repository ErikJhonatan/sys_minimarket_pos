import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  HiOutlineTag,
  HiOutlinePhotograph,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineCollection,
  HiOutlineHashtag,
  HiOutlineArchive
} from 'react-icons/hi';
import { createProductSchema, updateProductSchema } from './schema/producto.schema';
import productoApi from '../../api/productoApi';
import categoriaApi from '../../api/categoriaApi';

const ProductoForm = ({ producto, onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const isEditing = !!producto;
  const schema = isEditing ? updateProductSchema : createProductSchema;

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
      price: '',
      description: '',
      image: '',
      categoryId: '',
      stock: '',
      stockMin: '',
      code: ''
    }
  });

  const watchedImage = watch('image');

  // Cargar categorías
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await categoriaApi.getAll();
        // La respuesta puede venir directamente como array o dentro de data
        const categoriasData = response.data || response || [];
        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };
    loadCategorias();
  }, []);

  // Cargar datos al editar
  useEffect(() => {
    if (producto) {
      setValue('name', producto.name);
      setValue('price', producto.price);
      setValue('description', producto.description);
      setValue('image', producto.image);
      setValue('categoryId', producto.categoryId);
      setValue('stock', producto.stock);
      setValue('stockMin', producto.stockMin);
      setValue('code', producto.code);
    } else {
      reset();
    }
  }, [producto, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      // Convertir strings a números donde sea necesario
      const productData = {
        ...data,
        price: Number(data.price) || 0,
        categoryId: Number(data.categoryId),
        stock: Number(data.stock) || 0,
        stockMin: Number(data.stockMin) || 0
      };

      if (isEditing) {
        await productoApi.update(producto.id, productData);
      } else {
        await productoApi.create(productData);
      }
      onSuccess();
      reset();
    } catch (error) {
      console.error('Error al guardar producto:', error);
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

        {/* Nombre */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Nombre del producto</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: Coca Cola 600ml"
              className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
              {...register('name')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineTag size={18} />
            </span>
          </div>
          {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Código */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Código del producto</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: CC600"
              className={`input input-bordered w-full pl-10 ${errors.code ? 'input-error' : ''}`}
              {...register('code')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineHashtag size={18} />
            </span>
          </div>
          {errors.code && <p className="text-error text-xs mt-1">{errors.code.message}</p>}
        </div>

        {/* Precio */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Precio</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              placeholder="3.10"
              className={`input input-bordered w-full pl-10 ${errors.price ? 'input-error' : ''}`}
              {...register('price', { valueAsNumber: true })}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineCurrencyDollar size={18} />
            </span>
          </div>
          {errors.price && <p className="text-error text-xs mt-1">{errors.price.message}</p>}
        </div>

        {/* Descripción */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Descripción</span>
          </label>
          <div className="relative">
            <textarea
              placeholder="Descripción del producto..."
              className={`textarea textarea-bordered w-full pl-10 pt-3 ${errors.description ? 'textarea-error' : ''}`}
              rows="3"
              {...register('description')}
            />
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineDocumentText size={18} />
            </span>
          </div>
          {errors.description && <p className="text-error text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Categoría */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Categoría</span>
          </label>
          <div className="relative">
            <select
              className={`select select-bordered w-full pl-10 ${errors.categoryId ? 'select-error' : ''}`}
              {...register('categoryId', {
                setValueAs: (value) => value === '' ? undefined : Number(value)
              })}
              disabled={loadingCategorias}
              defaultValue=""
            >
              <option disabled={true} value="">
                {loadingCategorias ? "Cargando..." : "Selecciona una categoría"}
              </option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </select>
            <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
              <HiOutlineCollection size={18} />
            </span>
          </div>
          {errors.categoryId && <p className="text-error text-xs mt-1">{errors.categoryId.message}</p>}
          {loadingCategorias && (
            <p className="text-info text-xs mt-1">Cargando categorías...</p>
          )}
          {!loadingCategorias && categorias.length === 0 && (
            <p className="text-warning text-xs mt-1">No hay categorías disponibles</p>
          )}
        </div>

        {/* Stock y Stock Mínimo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Stock actual</span>
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="100"
                className={`input input-bordered w-full pl-10 ${errors.stock ? 'input-error' : ''}`}
                {...register('stock', { valueAsNumber: true })}
              />
              <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
                <HiOutlineArchive size={18} />
              </span>
            </div>
            {errors.stock && <p className="text-error text-xs mt-1">{errors.stock.message}</p>}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Stock mínimo</span>
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="10"
                className={`input input-bordered w-full pl-10 ${errors.stockMin ? 'input-error' : ''}`}
                {...register('stockMin', { valueAsNumber: true })}
              />
              <span className="absolute top-3 left-3 text-base-content/50 pointer-events-none z-10">
                <HiOutlineArchive size={18} />
              </span>
            </div>
            {errors.stockMin && <p className="text-error text-xs mt-1">{errors.stockMin.message}</p>}
          </div>
        </div>

        {/* Imagen */}
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
          {errors.image && <p className="text-error text-xs mt-1">{errors.image.message}</p>}
        </div>

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
                ? 'Actualizar Producto'
                : 'Crear Producto'
            }
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductoForm;
