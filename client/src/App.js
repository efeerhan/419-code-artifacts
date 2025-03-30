import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [selectedCombinations, setSelectedCombinations] = useState([]);
  const [rmseData, setRmseData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const combinations = [
    { id: 'none', feature: 'No Features', gender: false, age: false, occupation: false },
    { id: 'gender', feature: 'Gender', gender: true, age: false, occupation: false },
    { id: 'age', feature: 'Age', gender: false, age: true, occupation: false },
    { id: 'occupation', feature: 'Occupation', gender: false, age: false, occupation: true },
    { id: 'gender_age', feature: 'Gender & Age', gender: true, age: true, occupation: false },
    { id: 'age_occupation', feature: 'Age & Occupation', gender: false, age: true, occupation: true },
    { id: 'gender_occupation', feature: 'Gender & Occupation', gender: true, age: false, occupation: true },
    { id: 'all', feature: 'All Features', gender: true, age: true, occupation: true }
  ];

  const colorMap = {
    'No Features': '#8884d8',
    'Gender': '#82ca9d',
    'Age': '#ffc658',
    'Occupation': '#ff7300',
    'Gender & Age': '#387908',
    'Age & Occupation': '#00C49F',
    'Gender & Occupation': '#FFBB28',
    'All Features': '#FF8042'
  };

  // Fetch and combine data for selected combinations
  useEffect(() => {
    const fetchData = async () => {
      if (selectedCombinations.length === 0) {
        setRmseData([]);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        // Fetch data in parallel for all selected combinations
        const results = await Promise.all(
          selectedCombinations.map(async (comboId) => {
            const combo = combinations.find(c => c.id === comboId);
            const query = `?gender=${combo.gender}&age=${combo.age}&occupation=${combo.occupation}`;
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/get_rmse_data${query}`);
            
            if (!response.ok) throw new Error(`Failed to fetch data for ${combo.feature}`);
            const data = await response.json();
            return { feature: combo.feature, data: data.data };
          })
        );

        // Combine data points
        const combinedData = {};
        results.forEach(({ feature, data }) => {
          data.forEach(point => {
            if (!combinedData[point.subsample_fraction]) {
              combinedData[point.subsample_fraction] = { subsample_fraction: point.subsample_fraction };
            }
            combinedData[point.subsample_fraction][feature] = point.RMSE;
          });
        });

        // Sort by subset size
        setRmseData(Object.values(combinedData).sort((a, b) => a.subsample_fraction - b.subsample_fraction));
      } catch (error) {
        setError('Error fetching data');
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCombinations]);

  const handleCombinationChange = (comboId) => {
    setSelectedCombinations(prev => 
      prev.includes(comboId) 
        ? prev.filter(id => id !== comboId)
        : [...prev, comboId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold my-4 text-white">Feature Impact Visualizer</h1>
        <div className="flex flex-row gap-4 mb-4 items-center">
          <h2 className="text-xl font-semibold text-indigo-400 bg-indigo-800/20 w-fit p-1 rounded-lg">CMPT 419 Final Project</h2>
          <div className="flex flex-col">
            <p className="text-lg font-light text-gray-400">Prof. Nicholas Vincent</p>
            <p className="text-sm text-gray-500">Efe Erhan | Katya Kubyshkin | Nida Anwar | Zoe Stanley</p>
          </div>
        </div>
          <p className="text-gray-300 mb-4">
            Our project explored the impact of feature withholding and subsample size on recommendation model performance.
            We used the MovieLens 1M dataset + MovieLens user demographic data with an alternating least squares approach to explore these impacts.
            Our hypothesis was that feature withholding would lead to a decrease in model performance, and that this effect would be more pronounced at lower subsample sizes.
            The trend of our resulting data supports our hypothesis.
          </p>
          <h2 className="text-xl font-semibold mb-4 text-indigo-400 bg-indigo-800/20 w-fit p-1 rounded-lg">Visualization Tool</h2>
          <p className="text-gray-300 mb-4 ">
            To use this visualization tool, select the feature combination to be included in model training.
            The resulting plot shows subset size on the x-axis against RMSE results from model training on the y-axis.
          </p>
          {/* Feature selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {combinations.map((combo) => (
              <label 
                key={combo.id} 
                className={`inline-flex items-center p-2 border rounded cursor-pointer transition-colors duration-200
                  ${selectedCombinations.includes(combo.id) 
                    ? 'bg-indigo-600 border-indigo-500 hover:bg-indigo-700' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
              >
                <input
                  type="checkbox"
                  checked={selectedCombinations.includes(combo.id)}
                  onChange={() => handleCombinationChange(combo.id)}
                  className="h-4 w-4 rounded border-gray-700"
                />
                <span className="ml-2 text-gray-200">{combo.feature}</span>
              </label>
            ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded">
            {error}
            <button 
              className="ml-2 text-blue-300 underline" 
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-4 text-blue-400 bg-blue-900/50 p-3 rounded">
            Loading data...
          </div>
        )}

        {/* RMSE chart */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg">
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              RMSE vs Subset Size
            </h2>
            <button
              className="bg-indigo-700/50 text-white mb-4 px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors duration-200"
              onClick={() => {
                setSelectedCombinations([]);
              }}
              >
              Reset selections
            </button>
          </div>
        
          <div className="bg-gray-900 p-4 rounded" style={{ height: '500px' }}>
            {selectedCombinations.length === 0 && (
              <div className="text-indigo-400 h-full flex items-center justify-center">
                Select a feature combination to start.
              </div>
            )}
            {selectedCombinations.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rmseData}>
                <XAxis 
                  dataKey="subsample_fraction" 
                  label={{ value: 'Subset Size', position: 'bottom', fill: '#e5e7eb' }}
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => value.toFixed(2)}
                  stroke="#e5e7eb"
                />
                <YAxis 
                  label={{ value: 'RMSE', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }}
                  type="number"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => value.toFixed(3)}
                  stroke="#e5e7eb"
                />
                <Tooltip 
                  formatter={(value) => [value ? value.toFixed(3) : 'N/A', 'RMSE']}
                  labelFormatter={(label) => `Subset Size: ${label.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#e5e7eb' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#e5e7eb', paddingTop: '20px' }}
                />
                {selectedCombinations.map((comboId) => {
                  const combo = combinations.find(c => c.id === comboId);
                  if (!combo) return null;
                  
                  return (
                    <Line 
                      key={comboId}
                      type="monotone" 
                      dataKey={combo.feature}
                      stroke={colorMap[combo.feature]}
                      name={combo.feature}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls={true}
                      isAnimationActive={true}
                      animationDuration={500}
                      animationEasing="ease-in-out"
                    />
                  );
                })}
              </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;