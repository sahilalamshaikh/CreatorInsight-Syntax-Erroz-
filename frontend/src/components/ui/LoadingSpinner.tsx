export default function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="border-2 border-gray-200 rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        borderTopColor: '#534AB7',
      }}
    />
  );
}
