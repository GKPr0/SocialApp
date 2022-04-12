using MediatR;
using Microsoft.EntityFrameworkCore;
using Domain;
using Persistence;
using Application.Core;

namespace Application.Activities;

public class List
{
    public class Query : IRequest<Result<List<Activity>>>{}

    public class Handler : IRequestHandler<Query, Result<List<Activity>>>
    {
        private readonly DataContext context;
        public Handler(DataContext context)
        {
            this.context = context;
        }

        public async Task<Result<List<Activity>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var activities = await context.Activities.ToListAsync();
            return Result<List<Activity>>.Success(activities);
        }
    }
}
