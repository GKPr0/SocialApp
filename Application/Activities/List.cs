using MediatR;
using Microsoft.EntityFrameworkCore;
using Domain;
using Persistence;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace Application.Activities;

public class List
{
    public class Query : IRequest<Result<List<ActivityDTO>>>{}

    public class Handler : IRequestHandler<Query, Result<List<ActivityDTO>>>
    {
        private readonly DataContext context;
        private readonly IMapper mapper;

        public Handler(DataContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        } 
    

        public async Task<Result<List<ActivityDTO>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var activities = await context.Activities
                .ProjectTo<ActivityDTO>(mapper.ConfigurationProvider)
                .ToListAsync();

            return Result<List<ActivityDTO>>.Success(activities);
        }
    }
}
