import { UploadVideoButton } from "../../components/upload-video-button";

const TestPage = () => {
  return (
    <div>
      <UploadVideoButton
        categoryIds={[]}
        onUpdate={() => {
          console.log(123);
        }}
      ></UploadVideoButton>
    </div>
  );
};

export default TestPage;
