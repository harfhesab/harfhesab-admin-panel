import React, { memo } from "react";
import Globals from "@/utils/Globals";
import Image from "next/image";

const ImageComponent = ({
  src,
  parentclasses,
  imageClasses,
  alt,
  loadingType = "lazy",
  baseURI = true,
}: {
  src: string;
  parentclasses: string;
  imageClasses?: string;
  alt?: string;
  loadingType?: any;
  baseURI?: boolean;
}) => {
  return (
    <div onClick={()=>{console.log(`${Globals.uri}${src}`)}} className={`${parentclasses} relative`}>
      <Image
        className={`${imageClasses} inset-0 h-full w-full rounded-md bg-gray-50 object-cover`}
        src={baseURI ? `${Globals.uri}${src}` : src}
        alt={alt || "files_photo"}
        fill={true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading={loadingType}
      />
    </div>
  );
};

export default memo(ImageComponent);
