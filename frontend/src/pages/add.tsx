import { AddPostForm } from '../components/AddPostForm';

export default function AddPost() {
    return (
        <div className="d-flex justify-content-center">
            <div className="card col-8 mb-4 mt-4">
                <div className="card-body">
                    <AddPostForm />
                </div>
            </div>
        </div>
    );
}
