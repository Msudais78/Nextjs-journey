const page = async ({ params }: { params: { id: Promise<string>; name: string } }) => {
  const { id, name } = await params;
  console.log(id, name);
  return (
    <div className='flex flex-col items-center justify-center h-screen text-black'>
      <h1 className='text-5xl font-bold'>This is user page</h1>
      <h2 className='text-3xl font-bold'>hello world , this is user {name} id {id} page created by Sudais</h2>
    </div>
  );
};

export default page;