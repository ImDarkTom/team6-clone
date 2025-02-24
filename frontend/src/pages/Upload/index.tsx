import Spinner from '@/components/Spinner';
import useAuthenticated from '@/hooks/useAuthenticated';
import sendAuthedAxios from '@/utils/sendAuthedAxios';
import { ChangeEvent, useEffect, useState } from 'react';

type Props = {
	closeModal: () => void;
	setSummarizedDocs: (docs: any[]) => void;
}

function UploadPage(props: Props) {
	const {closeModal, setSummarizedDocs} = props; 
	
	const [file, setFile] = useState<File>();
	const [errorMessage, setErrorMessage] = useState('');
	const [fileSelected, setFileSelected] = useState(true);
	const [loading, setLoading] = useState<boolean>(false);
	const token = useAuthenticated({navToLoginOnUnauthed: false});

	useEffect(() => {
		setFileSelected(file !== undefined);
	}, [file]);

	/**
	 * Handle file change
	 * @param e 
	 * @returns 
	 */
	function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
		if (e.target.files) {
			const type = e.target.files[0].type;

			if (type !== 'application/pdf') {
				setErrorMessage('Invalid file. Select a PDF');
				return;
			}

			setErrorMessage('');
			setFile(e.target.files[0]);
		}
	}

	/**
	 * Handle file upload
	 * @returns 
	 */
	async function handleUploadClick() {
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		try {
			setLoading(true);

			// Save Document
			const res = await sendAuthedAxios('/document/upload', {
				data: formData,
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data'
				},
			}, token);

			// Get summarized documents
			const summaryRes = await sendAuthedAxios('/document/summarized', {
				method: 'GET',
			}, token);
			
			// Update summaries in Dashboard via the callback
			setSummarizedDocs(summaryRes.data.documents);

			// close upload modal
			closeModal();
			console.log('✅ Uploaded file response: ', res.data);
		} catch (error) {
			console.error('❌ Profile Update Error:', error);
		}
	}

	return (
		<div className="flex flex-col justify-center items-center w-full h-full z-10 bg-black/50 fixed" onClick={closeModal}>
			<div className="w-80 h-60 bg-gray-700 rounded-xl flex flex-col items-center box-border p-4" onClick={(e) => e.stopPropagation()}>
				<div className='flex flex-row gap-4'>
					<label htmlFor="file-upload" 
						className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl cursor-pointer w-auto "
					>Select PDF</label>
					<input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
					<button onClick={handleUploadClick} disabled={!fileSelected} className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-default">Upload✨</button>
				</div>
				<span className='text-red-400'>{errorMessage}</span>
				<>
					{ !loading ? (
						fileSelected ? <span className='text-green-400 my-4'>Selected: {file?.name}</span> : null
					) : <div className="flex flex-1 justify-center items-center w-full">
						<Spinner />
					</div>
					}
				</>
			</div>
		</div>
	);
}

export default UploadPage;