export default function UserMessage({ message }) {
  return (
    <div className="my-6 flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-blue-600 px-6 py-4 text-base leading-relaxed text-white shadow-sm">
        {message}
      </div>
    </div>
  );
}