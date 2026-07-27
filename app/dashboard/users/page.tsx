import Link from "next/link";
const users = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-black">
            <h1 className="text-5xl font-bold">This is user page</h1>
            <h2 className="text-3xl font-bold">
                hello world , this is user page created by Sudais
            </h2>
            <ul className="flex flex-col items-center justify-center space-y-4 mt-4">
                <li className="p-4 bg-gray-100 rounded-lg w-1/2 text-center"><Link href="/dashboard/users/1/suddas">user 1</Link></li>
                <li className="p-4 bg-gray-100 rounded-lg w-1/2 text-center"><Link href="/dashboard/users/2/ahmed">user 2</Link></li>
                <li className="p-4 bg-gray-100 rounded-lg w-1/2 text-center"><Link href="/dashboard/users/3/jawad">user 3</Link></li>
                <li className="p-4 bg-gray-100 rounded-lg w-1/2 text-center"><Link href="/dashboard/users/4/fawad">user 4</Link></li>
                <li className="p-4 bg-gray-100 rounded-lg w-1/2 text-center"><Link href="/dashboard/users/5/usama">user 5</Link></li>
            </ul>
        </div>
    )
}

export default users;