node dist/server.cjs > server.log 2>&1 &
SERVER_PID=$!
sleep 5
cat server.log
kill $SERVER_PID
