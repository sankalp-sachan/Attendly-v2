import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Save, ArrowLeft, Clock, Shield, List, Type, CheckCircle, 
    XCircle, FilePlus, Paperclip, Upload, LoaderCircle as Loader2, Image, ShieldCheck 
} from 'lucide-react';
import api from '../../utils/api';

const QuizCreate = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [password, setPassword] = useState('');
    const [duration, setDuration] = useState(30);
    const [backtrackingEnabled, setBacktrackingEnabled] = useState(true);
    const [showResult, setShowResult] = useState(true);
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['A', 'B', 'C', 'D'], correctOption: 0 }
    ]);
    const [questionFile, setQuestionFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    // AI Generation States
    const [syllabusAIText, setSyllabusAIText] = useState('');
    const [syllabusAIImage, setSyllabusAIImage] = useState(null);
    const [aiQuestionCount, setAiQuestionCount] = useState(5);
    const [aiDifficulty, setAiDifficulty] = useState('Medium');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['A', 'B', 'C', 'D'], correctOption: 0 }]);
    };

    const handleRemoveQuestion = (index) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleGenerateAI = async () => {
        if (!syllabusAIText && !syllabusAIImage) {
            return alert("Please provide syllabus text or an image for AI generation.");
        }

        setIsGeneratingAI(true);
        try {
            const formData = new FormData();
            if (syllabusAIImage) {
                formData.append('syllabusImage', syllabusAIImage);
            }
            if (syllabusAIText) {
                formData.append('syllabusText', syllabusAIText);
            }
            formData.append('questionCount', aiQuestionCount);
            formData.append('difficulty', aiDifficulty);

            const { data } = await api.post('/quizzes/generate-ai', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data && data.length > 0) {
                setQuestions(data);
                alert(`AI successfully forged ${data.length} evaluation modules!`);
            } else {
                alert("AI could not generate questions from the provided input.");
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "AI Generation failed.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleScan = async () => {
        if (!questionFile) return alert("Please select a file first");
        
        setIsScanning(true);
        try {
            const formData = new FormData();
            formData.append('questionFile', questionFile);
            
            const { data } = await api.post('/quizzes/scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (data && data.length > 0) {
                setQuestions(data);
                alert(`Successfully extracted ${data.length} questions!`);
            } else {
                alert("No questions could be extracted. Please ensure the document follows a numbered format (1. Question, A) Option...)");
            }
        } catch (error) {
            alert(error.response?.data?.message || "Scan failed. Ensure the server is running and the file is valid.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!title || !password) return alert("Title and Password are required");
        
        const finalQuestions = questions.map((q, i) => ({
            ...q,
            questionText: q.questionText || `Evaluation Module #${i + 1}`
        }));

        for (const q of finalQuestions) {
            if (q.options.some(o => !o)) {
                return alert("Please provide all options for each question");
            }
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('classId', classId);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('password', password);
            formData.append('duration', duration);
            formData.append('backtrackingEnabled', backtrackingEnabled);
            formData.append('showResult', showResult);
            formData.append('questions', JSON.stringify(finalQuestions));
            if (questionFile) {
                formData.append('questionFile', questionFile);
            }

            await api.post('/quizzes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Quiz created successfully!");
            navigate(`/teacher/classes/${classId}`);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-8 lg:p-10 font-sans text-white">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center gap-6 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Forge New Quiz</h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Quiz Construction Interface</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* AI Generation Card */}
                    <div className="card p-8 bg-violet-900/10 border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] space-y-6 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-all"></div>
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-violet-400">
                            <Shield className="w-6 h-6 animate-pulse" />
                            AI Genius Forge
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-violet-400/60">Syllabus / Concept Text</label>
                                <textarea
                                    placeholder="Paste syllabus modules or core concepts here..."
                                    value={syllabusAIText}
                                    onChange={(e) => setSyllabusAIText(e.target.value)}
                                    className="input-field bg-black/40 border-violet-500/20 focus:border-violet-500/50 min-h-[120px] py-4 text-sm"
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-violet-400/60">Upload Syllabus Image (OCR)</label>
                                <div className="relative h-[120px]">
                                    <input
                                        type="file"
                                        onChange={(e) => setSyllabusAIImage(e.target.files[0])}
                                        className="hidden"
                                        id="syllabus-image-upload"
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="syllabus-image-upload"
                                        className="flex flex-col items-center justify-center h-full bg-black/40 border-2 border-dashed border-violet-500/20 rounded-2xl cursor-pointer hover:border-violet-500/50 transition-all"
                                    >
                                        <Image className="w-6 h-6 text-violet-400 mb-2" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-violet-300">
                                            {syllabusAIImage ? syllabusAIImage.name : 'Stitch Image Asset'}
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* AI Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 p-6 rounded-2xl border border-violet-500/10">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-violet-400/60">Module Count</label>
                                <div className="flex gap-2">
                                    {[5, 10, 15].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setAiQuestionCount(num)}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${aiQuestionCount === num ? 'bg-violet-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                        >
                                            {num} MCQs
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-violet-400/60">Logic Depth (Difficulty)</label>
                                <div className="flex gap-2">
                                    {['Easy', 'Medium', 'Hard'].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setAiDifficulty(level)}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${aiDifficulty === level ? 'bg-violet-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={isGeneratingAI}
                            className="w-full py-4 bg-violet-600/20 border border-violet-500/30 rounded-[1.5rem] text-violet-400 font-black text-xs uppercase tracking-[0.25em] hover:bg-violet-600 hover:text-white transition-all flex items-center justify-center gap-3 group/ai shadow-lg shadow-violet-900/20"
                        >
                            {isGeneratingAI ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>AI Neural Processing...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5 group-hover/ai:scale-110 transition-transform" />
                                    <span>Generate Evaluation Matrix</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="card p-8 bg-slate-900/40 border-white/5 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quiz Title</label>
                                <div className="relative">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter quiz title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="input-field pl-12 bg-black/20"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Password</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                    <input
                                        type="text"
                                        placeholder="Set join password..."
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-12 bg-black/20 font-mono"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duration (Minutes)</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                                    <input
                                        type="number"
                                        placeholder="30"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="input-field pl-12 bg-black/20"
                                        required
                                    />
                                </div>
                            </div>

                            {/* New Settings Toggles */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-[2rem] border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-tight">Allow Backtracking</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">Students can revisit previous modules</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setBacktrackingEnabled(!backtrackingEnabled)}
                                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${backtrackingEnabled ? 'bg-primary-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${backtrackingEnabled ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-tight">Instant Result Insight</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">Show score immediately after termination</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowResult(!showResult)}
                                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${showResult ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${showResult ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description (Optional)</label>
                                <textarea
                                    placeholder="Briefly describe the quiz objectives..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="input-field bg-black/20 min-h-[100px] py-4"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Question Ref. Document (Optional PDF Only)</label>
                                <div className="relative group/file" id="pdf-input-container">
                                    <input
                                        type="file"
                                        onChange={(e) => setQuestionFile(e.target.files[0])}
                                        className="hidden"
                                        id="quiz-file-upload"
                                        accept=".pdf"
                                    />
                                    <label
                                        htmlFor="quiz-file-upload"
                                        className="flex items-center justify-between p-6 bg-black/20 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer group-hover/file:border-primary-500/50 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-600/10 text-primary-400 flex items-center justify-center">
                                                <Paperclip className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{questionFile ? questionFile.name : 'Stitch a digital manuscript...'}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Questions defined in external document</p>
                                            </div>
                                        </div>
                                        <div className="btn-secondary px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            {questionFile ? 'Change Asset' : 'Select File'}
                                        </div>
                                    </label>
                                </div>
                                {questionFile && (
                                    <motion.button
                                        type="button"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={handleScan}
                                        disabled={isScanning}
                                        className="mt-4 w-full py-4 bg-primary-600/20 border-2 border-primary-500/30 rounded-2xl text-primary-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center gap-3"
                                    >
                                        {isScanning ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Analyzing Manuscript...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                <span>Auto-Extract Questions</span>
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Questions Area */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <List className="w-5 h-5 text-primary-400" />
                                Question Matrix
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="px-4 py-2 bg-primary-600/10 text-primary-400 border border-primary-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Question</span>
                            </button>
                        </div>

                        {questions.map((q, qIndex) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={qIndex}
                                className="card p-8 bg-slate-900/40 border-white/5 space-y-6 relative group"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-400">
                                        {qIndex + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(qIndex)}
                                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-40 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Question label (e.g. Question 1) or body text... (Optional with File)"
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-white/10 py-3 text-lg font-bold outline-none focus:border-primary-500 transition-all placeholder:text-slate-700 placeholder:text-sm"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                        {q.options.map((option, oIndex) => (
                                            <div key={oIndex} className="relative group/opt">
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    className={`w-full bg-black/20 border-2 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none ${q.correctOption === oIndex ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5 focus:border-white/20'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuestionChange(qIndex, 'correctOption', oIndex)}
                                                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${q.correctOption === oIndex ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-600 group-hover/opt:text-white group-hover/opt:bg-white/10'}`}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-4">
                                        Select the <span className="text-emerald-500">Correct Option</span> by clicking the check icon.
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-10 flex justify-end">
                        <button
                            disabled={loading}
                            className="btn-primary px-12 py-5 rounded-[2rem] text-xs uppercase font-black tracking-[0.3em] flex items-center gap-3 shadow-2xl shadow-primary-500/20 disabled:opacity-50"
                        >
                            {loading ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>{loading ? 'Initializing...' : 'Deploy Quiz System'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizCreate;
