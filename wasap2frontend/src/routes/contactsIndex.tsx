import { Image } from "@nextui-org/react";

export default function Index() {
  return (
    <div className="w-full h-full flex flex-col gap-3 justify-center items-center bg-green-500 text-white">
      <h1 className="text-5xl font-semibold">Bienvenido a wasap 2</h1>
      <Image
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmbhchvUKay2kEohoXQsCNbhki9lePspM_aYH_sqR8_KFuCVFM6EnwR4Da_7EDpZogyPw&usqp=CAU"
        alt="chat"
        width={400}
        height={400}
        radius="none"
        className="w-full"
      />
    </div>
  );
}
