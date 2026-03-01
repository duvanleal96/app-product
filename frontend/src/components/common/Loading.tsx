export const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="relative">
        <div className="spinner"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-6 text-gray-600 font-medium animate-pulse">Cargando productos...</p>
    </div>
  );
};

export const LoadingInline = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="relative">
        <div className="spinner"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
